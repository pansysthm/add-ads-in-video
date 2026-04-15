import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import readline from 'readline';

interface InsertionPoint {
  type: 'start' | 'middle' | 'end';
  time?: number; // in seconds
}

const VIDEO_EXTENSIONS = ['.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv', '.webm', '.m4v'];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function selectFile(prompt: string, defaultPath: string | null = null): Promise<string> {
  let filePath = '';
  while (!filePath || !fs.existsSync(filePath)) {
    const promptText = defaultPath
      ? `${prompt} (Enter để dùng mặc định: ${path.basename(defaultPath)}): `
      : prompt;
    filePath = await askQuestion(promptText);

    // Nếu Enter và có default, sử dụng default
    if (!filePath && defaultPath && fs.existsSync(defaultPath)) {
      return path.resolve(defaultPath);
    }

    if (!filePath || !fs.existsSync(filePath)) {
      console.log('❌ File không tồn tại. Vui lòng nhập đường dẫn hợp lệ.');
    }
  }
  return path.resolve(filePath);
}

async function selectFolder(prompt: string): Promise<string> {
  let folderPath = '';
  while (!folderPath || !fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) {
    folderPath = await askQuestion(prompt);
    if (!fs.existsSync(folderPath)) {
      console.log('❌ Folder không tồn tại. Vui lòng nhập đường dẫn hợp lệ.');
    } else if (!fs.statSync(folderPath).isDirectory()) {
      console.log('❌ Đường dẫn không phải là folder. Vui lòng nhập lại.');
    }
  }
  return path.resolve(folderPath);
}

function getVideoFiles(folderPath: string): string[] {
  const files = fs.readdirSync(folderPath);
  const videoFiles = files.filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return VIDEO_EXTENSIONS.includes(ext);
  });
  return videoFiles.map((file) => path.join(folderPath, file));
}

async function selectInsertionPoint(): Promise<InsertionPoint> {
  console.log('\n📍 Chọn vị trí chèn quảng cáo:');
  console.log('1. Đầu video (0s)');
  console.log('2. Giữa video (10s)');
  console.log('3. Cuối video');
  console.log('4. Tùy chọn thời điểm chèn (giây)');

  const choice = await askQuestion('Nhập lựa chọn (1-4): ');

  switch (choice) {
    case '1':
      return { type: 'start' };
    case '2':
      return { type: 'middle', time: 10 };
    case '3':
      return { type: 'end' };
    case '4': {
      const timeInput = await askQuestion('Nhập thời điểm chèn (giây): ');
      const parsedTime = parseFloat(timeInput);
      return { type: 'middle', time: isNaN(parsedTime) || parsedTime < 0 ? 10 : parsedTime };
    }
    default:
      console.log('⚠️ Lựa chọn không hợp lệ. Mặc định chèn ở đầu.');
      return { type: 'start' };
  }
}

function getVideoDuration(videoPath: string): number {
  try {
    const command = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`;
    const output = execSync(command, { encoding: 'utf-8' });
    const duration = parseFloat(output.trim());

    if (isNaN(duration) || duration <= 0) {
      throw new Error('Không thể lấy thời lượng video');
    }

    return duration;
  } catch (error) {
    console.error('❌ Lỗi khi lấy thời lượng video:', error);
    throw error;
  }
}

function getVideoDimensions(videoPath: string): { width: number; height: number } {
  try {
    const command = `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "${videoPath}"`;
    const output = execSync(command, { encoding: 'utf-8' }).trim();
    const [width, height] = output.split('x').map(Number);
    if (!width || !height || isNaN(width) || isNaN(height)) {
      throw new Error('Không thể lấy kích thước video');
    }
    return { width, height };
  } catch (error) {
    console.error('❌ Lỗi khi lấy kích thước video:', error);
    throw error;
  }
}

function insertAdVideo(
  originalVideo: string,
  adVideo: string,
  insertionPoint: InsertionPoint
): void {
  const originalDuration = getVideoDuration(originalVideo);
  const dim = getVideoDimensions(originalVideo);
  
  let insertTime = 0;
  if (insertionPoint.type === 'start') {
    insertTime = 0;
  } else if (insertionPoint.type === 'middle') {
    insertTime = insertionPoint.time || 10;
  } else if (insertionPoint.type === 'end') {
    insertTime = originalDuration;
  }

  // Chống lỗi nếu nhập thời điểm lớn hơn độ dài video
  if (insertTime > originalDuration) {
    insertTime = originalDuration;
  }

  console.log(`⏳ Đang xử lý (Chèn tại ${insertTime}s) - Chuẩn hóa khung hình: ${dim.width}x${dim.height}...`);

  const tempOutput = originalVideo + '.tmp.mp4';
  let command = '';

  try {
    if (insertionPoint.type === 'start' || insertTime === 0) {
      // Quảng cáo ở đầu
      command = `ffmpeg -y -i "${adVideo}" -i "${originalVideo}" -filter_complex "[0:v]scale=${dim.width}:${dim.height}:force_original_aspect_ratio=decrease,pad=${dim.width}:${dim.height}:(ow-iw)/2:(oh-ih)/2,setsar=1[ad_v];[ad_v][0:a][1:v][1:a]concat=n=2:v=1:a=1[outv][outa]" -map "[outv]" -map "[outa]" -c:v libx264 -preset faster -c:a aac "${tempOutput}"`;
      execSync(command, { stdio: 'inherit' });
    } else if (insertionPoint.type === 'end' || insertTime === originalDuration) {
      // Quảng cáo ở cuối
      command = `ffmpeg -y -i "${originalVideo}" -i "${adVideo}" -filter_complex "[1:v]scale=${dim.width}:${dim.height}:force_original_aspect_ratio=decrease,pad=${dim.width}:${dim.height}:(ow-iw)/2:(oh-ih)/2,setsar=1[ad_v];[0:v][0:a][ad_v][1:a]concat=n=2:v=1:a=1[outv][outa]" -map "[outv]" -map "[outa]" -c:v libx264 -preset faster -c:a aac "${tempOutput}"`;
      execSync(command, { stdio: 'inherit' });
    } else {
      // Quảng cáo ở giữa
      console.log('   Đang tách video gốc làm 2 phần...');
      const part1 = originalVideo + '.part1.mp4';
      const part2 = originalVideo + '.part2.mp4';

      // Tách video thành part1 và part2
      execSync(`ffmpeg -y -i "${originalVideo}" -t ${insertTime} -c copy "${part1}"`, { stdio: 'pipe' });
      execSync(`ffmpeg -y -i "${originalVideo}" -ss ${insertTime} -c copy "${part2}"`, { stdio: 'pipe' });

      // Ghép part1 + advideo + part2
      console.log('   Đang chuẩn hóa tỷ lệ và ghép video (mất vài phút)...');
      command = `ffmpeg -y -i "${part1}" -i "${adVideo}" -i "${part2}" -filter_complex "[1:v]scale=${dim.width}:${dim.height}:force_original_aspect_ratio=decrease,pad=${dim.width}:${dim.height}:(ow-iw)/2:(oh-ih)/2,setsar=1[ad_v];[0:v][0:a][ad_v][1:a][2:v][2:a]concat=n=3:v=1:a=1[outv][outa]" -map "[outv]" -map "[outa]" -c:v libx264 -preset faster -c:a aac "${tempOutput}"`;
      
      execSync(command, { stdio: 'inherit' });

      // Dọn file tạm lúc chèn giữa
      fs.unlinkSync(part1);
      fs.unlinkSync(part2);
    }

    // Xóa file gốc và đổi tên file tạm thành file gốc
    fs.unlinkSync(originalVideo);
    fs.renameSync(tempOutput, originalVideo);

    console.log(`✅ Hoàn thành!`);
  } catch (error) {
    if (fs.existsSync(tempOutput)) {
      try { fs.unlinkSync(tempOutput); } catch(e) {}
    }
    const part1 = originalVideo + '.part1.mp4';
    if (fs.existsSync(part1)) {
      try { fs.unlinkSync(part1); } catch(e) {}
    }
    const part2 = originalVideo + '.part2.mp4';
    if (fs.existsSync(part2)) {
      try { fs.unlinkSync(part2); } catch(e) {}
    }
    console.error('❌ Lỗi:', error);
    throw error;
  }
}

async function main() {
  console.log('🎬 === Video Ad Inserter (Batch) ===\n');

  const DEFAULT_AD_PATH = 'C:\\Users\\Admin\\Videos\\Ads\\ads_1.mp4';

  try {
    // Chọn folder chứa video gốc
    const originalFolder = await selectFolder('📁 Đường dẫn folder chứa video gốc: ');

    // Lấy danh sách video từ folder
    const videoFiles = getVideoFiles(originalFolder);

    if (videoFiles.length === 0) {
      console.log('❌ Không tìm thấy file video nào trong folder.');
      rl.close();
      return;
    }

    console.log(`\n✅ Tìm thấy ${videoFiles.length} file video:`);
    videoFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${path.basename(file)}`);
    });

    // Kiểm tra xem default ad có tồn tại
    const hasDefaultAd = fs.existsSync(DEFAULT_AD_PATH);
    const adVideo = await selectFile('\n📁 Đường dẫn video quảng cáo: ', hasDefaultAd ? DEFAULT_AD_PATH : null);

    if (hasDefaultAd) {
      console.log(`   (Sử dụng: ${path.basename(DEFAULT_AD_PATH)})`);
    }

    const insertionPoint = await selectInsertionPoint();

    // ⚠️ Xác nhận trước khi ghi đè
    console.log('\n' + '⚠️ '.repeat(25));
    console.log('\n⚠️  CẢNH BÁO: Video sẽ được GHI ĐÈ trực tiếp trong folder gốc!');
    console.log('   Không thể khôi phục sau khi xóa.');
    console.log('\n   Video sẽ xử lý:');
    videoFiles.forEach((file, index) => {
      if (index < 5) {
        console.log(`   - ${path.basename(file)}`);
      }
    });
    if (videoFiles.length > 5) {
      console.log(`   ... và ${videoFiles.length - 5} file khác`);
    }

    const confirm = await askQuestion('\n❓ Bạn chắc chắn muốn tiếp tục? (yes/no): ');
    if (confirm.toLowerCase() !== 'yes') {
      console.log('\n❌ Đã hủy bỏ.');
      rl.close();
      return;
    }

    console.log('\n' + '='.repeat(50));
    console.log('🚀 Bắt đầu xử lý...\n');

    let successCount = 0;
    let failCount = 0;

    // Xử lý từng video
    for (let i = 0; i < videoFiles.length; i++) {
      const videoPath = videoFiles[i];

      console.log(`[${i + 1}/${videoFiles.length}] ${path.basename(videoPath)}`);

      try {
        insertAdVideo(videoPath, adVideo, insertionPoint);
        successCount++;
      } catch (error) {
        console.error(`           Lỗi: ${error}`);
        failCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`\n✅ Hoàn thành!`);
    console.log(`   ✔️  Thành công: ${successCount}/${videoFiles.length}`);
    if (failCount > 0) {
      console.log(`   ❌ Thất bại: ${failCount}/${videoFiles.length}`);
    }
    console.log(`\n📁 Video được lưu tại: ${originalFolder}\n`);

    rl.close();
  } catch (error) {
    console.error('❌ Có lỗi xảy ra:', error);
    rl.close();
    process.exit(1);
  }
}

main();
