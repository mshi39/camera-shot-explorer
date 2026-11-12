import { create } from "zustand";

export type Language = "en" | "zh";
const chinese: Record<string, string> = {
  "Camera Shot Explorer": "镜头探索器", "A study in perspective": "探索镜头与视角",
  "Camera Preview": "相机预览", "LIVE": "实时", "Export Image": "导出图片",
  "Export failed. Please try again.": "导出失败，请重试。",
  "Interaction guide": "操作指南", "Interaction guide details": "操作指南详情",
  "Explore your shot": "探索你的镜头", "Got it": "知道了",
  "Drag the background to orbit your view. Scroll to zoom the workspace.": "拖动背景可环绕观察视角，滚动滚轮可缩放工作区。",
  "Select and drag the camera. Use H / V / D in Position mode or Y / P / R in Rotation mode to restrict dragging to one axis. Press the same key again or Esc to release it.": "选中并拖动相机。位置模式下按 H / V / D，旋转模式下按 Y / P / R，可限制为单轴拖动。再次按同一键或 Esc 取消限制。",
  "S switches modes. Shift+R resets position or rotation in the active mode. L aims at the subject.": "S 切换模式；Shift+R 重置当前模式的位置或旋转；L 对准人物。",
  "Interactive 3D scene": "交互式三维场景", "Output framing": "输出画幅", "Aspect ratio": "画幅比例",
  "Camera selected": "已选中相机", "Restrict camera drag": "限制相机拖动方向",
  "Drag camera or handles": "拖动相机或控制柄", "Drag background to orbit": "拖动背景环绕观察", "Scroll to zoom": "滚轮缩放",
  "Explore the frame.": "探索画面。", "50mm fixed lens": "50mm 固定镜头", "Changes saved on this device": "更改已保存在此设备",
  "Camera mode": "相机模式", "Position mode": "位置模式", "Rotation mode": "旋转模式",
  "Move the camera (S)": "移动相机（S）", "Rotate the camera (S)": "旋转相机（S）",
  "Position": "位置", "Rotation": "旋转", "Position Reset": "重置位置", "Rotation Reset": "重置旋转",
  "Look at Subject": "对准人物", "More camera actions": "更多相机操作",
  "Restore position; keep rotation (Shift+R)": "重置位置，保留旋转（Shift+R）", "Restore rotation; keep position (Shift+R)": "重置旋转，保留位置（Shift+R）",
  "Camera controls": "相机控制", "Camera position": "相机位置", "Camera rotation": "相机旋转", "Drag in scene or adjust below": "在场景中拖动或在下方调整",
  "Horizontal Orbit": "水平环绕", "Vertical Orbit": "垂直环绕", "Distance": "距离", "Yaw": "偏航", "Pitch": "俯仰", "Roll": "翻滚",
  "horizontal": "水平", "vertical": "垂直", "distance": "距离", "yaw": "偏航", "pitch": "俯仰", "roll": "翻滚",
  "Move around the subject. Camera orientation stays unchanged.": "围绕人物移动，保持相机朝向不变。",
  "Move above or below the subject. Camera orientation stays unchanged.": "向人物上方或下方移动，保持相机朝向不变。",
  "Move the filming camera closer to or farther from the subject.": "让拍摄相机靠近或远离人物。",
  "Turn left or right without moving the camera.": "左右转动相机，保持位置不变。",
  "Tilt up or down without moving the camera.": "上下俯仰相机，保持位置不变。",
  "Rotate around the lens axis. At 5° or more, the shot has a Dutch angle.": "绕镜头轴旋转；倾斜达到 5° 时标记为荷兰角。",
  "Shot information": "镜头信息", "Shot size": "景别", "Camera level": "机位高度", "Viewpoint": "拍摄方位", "Composition": "构图", "FULL FRAME": "全画幅", "Dutch angle": "荷兰角",
  "Long Shot": "远景", "Full Shot": "全景", "Medium Full Shot": "中全景", "Cowboy Shot": "牛仔镜头", "Medium Shot": "中景", "Medium Close-Up": "中近景", "Close-Up": "特写", "Extreme Close-Up": "大特写", "Unclassified": "未分类",
  "Eye Level": "眼部高度", "Shoulder Level": "肩部高度", "Chest Level": "胸部高度", "Waist Level": "腰部高度", "Hip Level": "髋部高度", "Thigh Level": "大腿高度", "Knee Level": "膝盖高度", "Shin Level": "小腿高度", "Tatami Level": "榻榻米高度", "Ankle Level": "脚踝高度", "Ground Level": "地面高度", "Overhead Level": "头顶正上方",
  "Front": "正面", "Three-Quarter Front": "前侧四分之三", "Profile": "侧面", "Rear Three-Quarter": "后侧四分之三", "Back": "背面",
  "Left-weighted": "偏左", "Right-weighted": "偏右", "Centered": "居中",
  "AI shot prompt": "AI 镜头提示词", "Refresh": "刷新", "Refresh prompt": "刷新提示词", "Copy prompt": "复制提示词", "Out of date": "待刷新",
  "Generate from the current shot": "根据当前镜头生成", "Copy the displayed prompt": "复制当前显示的提示词", "Copied": "已复制",
  "Click Refresh to generate a prompt.": "点击刷新生成提示词。", "Select the prompt text and copy it manually.": "请选择提示词文字并手动复制。",
  "3D view unavailable": "无法显示三维视图", "Enable hardware acceleration in your browser, then reload this page.": "请开启浏览器硬件加速，然后重新加载页面。",
};
export function translate(text: string, language: Language): string {
  return language === "zh" ? chinese[text] ?? text : text;
}
function initialLanguage(): Language {
  try { return localStorage.getItem("camera-shot-language") === "zh" ? "zh" : "en"; }
  catch { return "en"; }
}
export const useLanguage = create<{ language: Language; toggle: () => void }>((set) => ({
  language: initialLanguage(),
  toggle: () => set(({ language }) => {
    const next = language === "en" ? "zh" : "en";
    try { localStorage.setItem("camera-shot-language", next); } catch { /* Storage is optional. */ }
    return { language: next };
  }),
}));
export function useTranslation() {
  const language = useLanguage((s) => s.language);
  return (text: string) => translate(text, language);
}
