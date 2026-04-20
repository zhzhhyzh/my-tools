import {
  FiFilePlus, FiScissors, FiRotateCw, FiList, FiCrop,
  FiMinimize2, FiTool, FiFileText, FiMonitor, FiGrid,
  FiImage, FiCode, FiShield, FiLock, FiUnlock,
  FiEye, FiSearch, FiEdit, FiHash, FiSlash, FiFile,
  FiArchive, FiLayers, FiType, FiGitPullRequest,
} from "react-icons/fi";

const iconMap = {
  merge: <FiFilePlus />,
  split: <FiScissors />,
  rotate: <FiRotateCw />,
  organize: <FiList />,
  crop: <FiCrop />,
  compress: <FiMinimize2 />,
  repair: <FiTool />,
  word: <FiFileText />,
  ppt: <FiMonitor />,
  excel: <FiGrid />,
  image: <FiImage />,
  html: <FiCode />,
  pdfa: <FiArchive />,
  watermark: <FiType />,
  numbers: <FiHash />,
  edit: <FiEdit />,
  redact: <FiSlash />,
  unlock: <FiUnlock />,
  lock: <FiLock />,
  ocr: <FiSearch />,
  compare: <FiGitPullRequest />,
};

export function getToolIcon(iconName) {
  return iconMap[iconName] || <FiFile />;
}
