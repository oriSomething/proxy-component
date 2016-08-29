import "setimmediate";
import SandBoxRenderer from "./utils/sand-box-renderer";


const containerElement = document.getElementById("application");
SandBoxRenderer.render("frame.html", containerElement!);
