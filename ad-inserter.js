"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var child_process_1 = require("child_process");
var readline_1 = __importDefault(require("readline"));
var VIDEO_EXTENSIONS = ['.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv', '.webm', '.m4v'];
var rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout,
});
function askQuestion(question) {
    return new Promise(function (resolve) {
        rl.question(question, function (answer) {
            resolve(answer.trim());
        });
    });
}
function selectFile(prompt_1) {
    return __awaiter(this, arguments, void 0, function (prompt, defaultPath) {
        var filePath, promptText;
        if (defaultPath === void 0) { defaultPath = null; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    filePath = '';
                    _a.label = 1;
                case 1:
                    if (!(!filePath || !fs_1.default.existsSync(filePath))) return [3 /*break*/, 3];
                    promptText = defaultPath
                        ? "".concat(prompt, " (Enter \u0111\u1EC3 d\u00F9ng m\u1EB7c \u0111\u1ECBnh: ").concat(path_1.default.basename(defaultPath), "): ")
                        : prompt;
                    return [4 /*yield*/, askQuestion(promptText)];
                case 2:
                    filePath = _a.sent();
                    // Nếu Enter và có default, sử dụng default
                    if (!filePath && defaultPath && fs_1.default.existsSync(defaultPath)) {
                        return [2 /*return*/, path_1.default.resolve(defaultPath)];
                    }
                    if (!filePath || !fs_1.default.existsSync(filePath)) {
                        console.log('❌ File không tồn tại. Vui lòng nhập đường dẫn hợp lệ.');
                    }
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/, path_1.default.resolve(filePath)];
            }
        });
    });
}
function selectFolder(prompt) {
    return __awaiter(this, void 0, void 0, function () {
        var folderPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    folderPath = '';
                    _a.label = 1;
                case 1:
                    if (!(!folderPath || !fs_1.default.existsSync(folderPath) || !fs_1.default.statSync(folderPath).isDirectory())) return [3 /*break*/, 3];
                    return [4 /*yield*/, askQuestion(prompt)];
                case 2:
                    folderPath = _a.sent();
                    if (!fs_1.default.existsSync(folderPath)) {
                        console.log('❌ Folder không tồn tại. Vui lòng nhập đường dẫn hợp lệ.');
                    }
                    else if (!fs_1.default.statSync(folderPath).isDirectory()) {
                        console.log('❌ Đường dẫn không phải là folder. Vui lòng nhập lại.');
                    }
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/, path_1.default.resolve(folderPath)];
            }
        });
    });
}
function getVideoFiles(folderPath) {
    var files = fs_1.default.readdirSync(folderPath);
    var videoFiles = files.filter(function (file) {
        var ext = path_1.default.extname(file).toLowerCase();
        return VIDEO_EXTENSIONS.includes(ext);
    });
    return videoFiles.map(function (file) { return path_1.default.join(folderPath, file); });
}
function selectInsertionPoint() {
    return __awaiter(this, void 0, void 0, function () {
        var choice, _a, timeInput, parsedTime;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('\n📍 Chọn vị trí chèn quảng cáo:');
                    console.log('1. Đầu video (0s)');
                    console.log('2. Giữa video (10s)');
                    console.log('3. Cuối video');
                    console.log('4. Tùy chọn thời điểm chèn (giây)');
                    return [4 /*yield*/, askQuestion('Nhập lựa chọn (1-4): ')];
                case 1:
                    choice = _b.sent();
                    _a = choice;
                    switch (_a) {
                        case '1': return [3 /*break*/, 2];
                        case '2': return [3 /*break*/, 3];
                        case '3': return [3 /*break*/, 4];
                        case '4': return [3 /*break*/, 5];
                    }
                    return [3 /*break*/, 7];
                case 2: return [2 /*return*/, { type: 'start' }];
                case 3: return [2 /*return*/, { type: 'middle', time: 10 }];
                case 4: return [2 /*return*/, { type: 'end' }];
                case 5: return [4 /*yield*/, askQuestion('Nhập thời điểm chèn (giây): ')];
                case 6:
                    timeInput = _b.sent();
                    parsedTime = parseFloat(timeInput);
                    return [2 /*return*/, { type: 'middle', time: isNaN(parsedTime) || parsedTime < 0 ? 10 : parsedTime }];
                case 7:
                    console.log('⚠️ Lựa chọn không hợp lệ. Mặc định chèn ở đầu.');
                    return [2 /*return*/, { type: 'start' }];
            }
        });
    });
}
function getVideoDuration(videoPath) {
    try {
        var command = "ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 \"".concat(videoPath, "\"");
        var output = (0, child_process_1.execSync)(command, { encoding: 'utf-8' });
        var duration = parseFloat(output.trim());
        if (isNaN(duration) || duration <= 0) {
            throw new Error('Không thể lấy thời lượng video');
        }
        return duration;
    }
    catch (error) {
        console.error('❌ Lỗi khi lấy thời lượng video:', error);
        throw error;
    }
}
function getVideoDimensions(videoPath) {
    try {
        var command = "ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 \"".concat(videoPath, "\"");
        var output = (0, child_process_1.execSync)(command, { encoding: 'utf-8' }).trim();
        var _a = output.split('x').map(Number), width = _a[0], height = _a[1];
        if (!width || !height || isNaN(width) || isNaN(height)) {
            throw new Error('Không thể lấy kích thước video');
        }
        return { width: width, height: height };
    }
    catch (error) {
        console.error('❌ Lỗi khi lấy kích thước video:', error);
        throw error;
    }
}
function insertAdVideo(originalVideo, adVideo, insertionPoint) {
    var originalDuration = getVideoDuration(originalVideo);
    var dim = getVideoDimensions(originalVideo);
    var insertTime = 0;
    if (insertionPoint.type === 'start') {
        insertTime = 0;
    }
    else if (insertionPoint.type === 'middle') {
        insertTime = insertionPoint.time || 10;
    }
    else if (insertionPoint.type === 'end') {
        insertTime = originalDuration;
    }
    // Chống lỗi nếu nhập thời điểm lớn hơn độ dài video
    if (insertTime > originalDuration) {
        insertTime = originalDuration;
    }
    console.log("\u23F3 \u0110ang x\u1EED l\u00FD (Ch\u00E8n t\u1EA1i ".concat(insertTime, "s) - Chu\u1EA9n h\u00F3a khung h\u00ECnh: ").concat(dim.width, "x").concat(dim.height, "..."));
    var tempOutput = originalVideo + '.tmp.mp4';
    var command = '';
    try {
        if (insertionPoint.type === 'start' || insertTime === 0) {
            // Quảng cáo ở đầu
            command = "ffmpeg -y -i \"".concat(adVideo, "\" -i \"").concat(originalVideo, "\" -filter_complex \"[0:v]scale=").concat(dim.width, ":").concat(dim.height, ":force_original_aspect_ratio=decrease,pad=").concat(dim.width, ":").concat(dim.height, ":(ow-iw)/2:(oh-ih)/2,setsar=1[ad_v];[ad_v][0:a][1:v][1:a]concat=n=2:v=1:a=1[outv][outa]\" -map \"[outv]\" -map \"[outa]\" -c:v libx264 -preset faster -c:a aac \"").concat(tempOutput, "\"");
            (0, child_process_1.execSync)(command, { stdio: 'inherit' });
        }
        else if (insertionPoint.type === 'end' || insertTime === originalDuration) {
            // Quảng cáo ở cuối
            command = "ffmpeg -y -i \"".concat(originalVideo, "\" -i \"").concat(adVideo, "\" -filter_complex \"[1:v]scale=").concat(dim.width, ":").concat(dim.height, ":force_original_aspect_ratio=decrease,pad=").concat(dim.width, ":").concat(dim.height, ":(ow-iw)/2:(oh-ih)/2,setsar=1[ad_v];[0:v][0:a][ad_v][1:a]concat=n=2:v=1:a=1[outv][outa]\" -map \"[outv]\" -map \"[outa]\" -c:v libx264 -preset faster -c:a aac \"").concat(tempOutput, "\"");
            (0, child_process_1.execSync)(command, { stdio: 'inherit' });
        }
        else {
            // Quảng cáo ở giữa
            console.log('   Đang tách video gốc làm 2 phần...');
            var part1 = originalVideo + '.part1.mp4';
            var part2 = originalVideo + '.part2.mp4';
            // Tách video thành part1 và part2
            (0, child_process_1.execSync)("ffmpeg -y -i \"".concat(originalVideo, "\" -t ").concat(insertTime, " -c copy \"").concat(part1, "\""), { stdio: 'pipe' });
            (0, child_process_1.execSync)("ffmpeg -y -i \"".concat(originalVideo, "\" -ss ").concat(insertTime, " -c copy \"").concat(part2, "\""), { stdio: 'pipe' });
            // Ghép part1 + advideo + part2
            console.log('   Đang chuẩn hóa tỷ lệ và ghép video (mất vài phút)...');
            command = "ffmpeg -y -i \"".concat(part1, "\" -i \"").concat(adVideo, "\" -i \"").concat(part2, "\" -filter_complex \"[1:v]scale=").concat(dim.width, ":").concat(dim.height, ":force_original_aspect_ratio=decrease,pad=").concat(dim.width, ":").concat(dim.height, ":(ow-iw)/2:(oh-ih)/2,setsar=1[ad_v];[0:v][0:a][ad_v][1:a][2:v][2:a]concat=n=3:v=1:a=1[outv][outa]\" -map \"[outv]\" -map \"[outa]\" -c:v libx264 -preset faster -c:a aac \"").concat(tempOutput, "\"");
            (0, child_process_1.execSync)(command, { stdio: 'inherit' });
            // Dọn file tạm lúc chèn giữa
            fs_1.default.unlinkSync(part1);
            fs_1.default.unlinkSync(part2);
        }
        // Xóa file gốc và đổi tên file tạm thành file gốc
        fs_1.default.unlinkSync(originalVideo);
        fs_1.default.renameSync(tempOutput, originalVideo);
        console.log("\u2705 Ho\u00E0n th\u00E0nh!");
    }
    catch (error) {
        if (fs_1.default.existsSync(tempOutput)) {
            try {
                fs_1.default.unlinkSync(tempOutput);
            }
            catch (e) { }
        }
        var part1 = originalVideo + '.part1.mp4';
        if (fs_1.default.existsSync(part1)) {
            try {
                fs_1.default.unlinkSync(part1);
            }
            catch (e) { }
        }
        var part2 = originalVideo + '.part2.mp4';
        if (fs_1.default.existsSync(part2)) {
            try {
                fs_1.default.unlinkSync(part2);
            }
            catch (e) { }
        }
        console.error('❌ Lỗi:', error);
        throw error;
    }
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var DEFAULT_AD_PATH, originalFolder, videoFiles, hasDefaultAd, adVideo, insertionPoint, confirm_1, successCount, failCount, i, videoPath, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🎬 === Video Ad Inserter (Batch) ===\n');
                    DEFAULT_AD_PATH = 'C:\\Users\\Admin\\Videos\\Ads\\ads_1.mp4';
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, selectFolder('📁 Đường dẫn folder chứa video gốc: ')];
                case 2:
                    originalFolder = _a.sent();
                    videoFiles = getVideoFiles(originalFolder);
                    if (videoFiles.length === 0) {
                        console.log('❌ Không tìm thấy file video nào trong folder.');
                        rl.close();
                        return [2 /*return*/];
                    }
                    console.log("\n\u2705 T\u00ECm th\u1EA5y ".concat(videoFiles.length, " file video:"));
                    videoFiles.forEach(function (file, index) {
                        console.log("   ".concat(index + 1, ". ").concat(path_1.default.basename(file)));
                    });
                    hasDefaultAd = fs_1.default.existsSync(DEFAULT_AD_PATH);
                    return [4 /*yield*/, selectFile('\n📁 Đường dẫn video quảng cáo: ', hasDefaultAd ? DEFAULT_AD_PATH : null)];
                case 3:
                    adVideo = _a.sent();
                    if (hasDefaultAd) {
                        console.log("   (S\u1EED d\u1EE5ng: ".concat(path_1.default.basename(DEFAULT_AD_PATH), ")"));
                    }
                    return [4 /*yield*/, selectInsertionPoint()];
                case 4:
                    insertionPoint = _a.sent();
                    // ⚠️ Xác nhận trước khi ghi đè
                    console.log('\n' + '⚠️ '.repeat(25));
                    console.log('\n⚠️  CẢNH BÁO: Video sẽ được GHI ĐÈ trực tiếp trong folder gốc!');
                    console.log('   Không thể khôi phục sau khi xóa.');
                    console.log('\n   Video sẽ xử lý:');
                    videoFiles.forEach(function (file, index) {
                        if (index < 5) {
                            console.log("   - ".concat(path_1.default.basename(file)));
                        }
                    });
                    if (videoFiles.length > 5) {
                        console.log("   ... v\u00E0 ".concat(videoFiles.length - 5, " file kh\u00E1c"));
                    }
                    return [4 /*yield*/, askQuestion('\n❓ Bạn chắc chắn muốn tiếp tục? (yes/no): ')];
                case 5:
                    confirm_1 = _a.sent();
                    if (confirm_1.toLowerCase() !== 'yes') {
                        console.log('\n❌ Đã hủy bỏ.');
                        rl.close();
                        return [2 /*return*/];
                    }
                    console.log('\n' + '='.repeat(50));
                    console.log('🚀 Bắt đầu xử lý...\n');
                    successCount = 0;
                    failCount = 0;
                    // Xử lý từng video
                    for (i = 0; i < videoFiles.length; i++) {
                        videoPath = videoFiles[i];
                        console.log("[".concat(i + 1, "/").concat(videoFiles.length, "] ").concat(path_1.default.basename(videoPath)));
                        try {
                            insertAdVideo(videoPath, adVideo, insertionPoint);
                            successCount++;
                        }
                        catch (error) {
                            console.error("           L\u1ED7i: ".concat(error));
                            failCount++;
                        }
                    }
                    console.log('\n' + '='.repeat(50));
                    console.log("\n\u2705 Ho\u00E0n th\u00E0nh!");
                    console.log("   \u2714\uFE0F  Th\u00E0nh c\u00F4ng: ".concat(successCount, "/").concat(videoFiles.length));
                    if (failCount > 0) {
                        console.log("   \u274C Th\u1EA5t b\u1EA1i: ".concat(failCount, "/").concat(videoFiles.length));
                    }
                    console.log("\n\uD83D\uDCC1 Video \u0111\u01B0\u1EE3c l\u01B0u t\u1EA1i: ".concat(originalFolder, "\n"));
                    rl.close();
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error('❌ Có lỗi xảy ra:', error_1);
                    rl.close();
                    process.exit(1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
main();
