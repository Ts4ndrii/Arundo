const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const nextDir = path.join(process.cwd(), ".next");

if (process.platform === "win32") {
	if (fs.existsSync(nextDir)) {
		execFileSync("cmd", ["/c", "rd", "/s", "/q", nextDir], { stdio: "inherit" });
	}
} else {
	fs.rmSync(nextDir, { recursive: true, force: true });
}