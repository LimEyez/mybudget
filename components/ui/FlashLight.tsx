import Svg, { G, Mask, Path, Rect } from "react-native-svg";

export default function FlashLightIcon({ width = "24", height = "24", fill = "#2A2630" }: { width?: string, height?: string, fill?: string }) {
    const widthNumber = Number(width);
    const heightNumber = Number(height)
    return (
        <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" >
            <Mask id="mask0_674_270" style={{maskType: "alpha"}} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                <Rect width={width} height={height} fill={fill} />
            </Mask>
            <G mask="url(#mask0_674_270)">
                <Path d="M10.55 18.2L15.725 12H11.725L12.45 6.325L7.825 13H11.3L10.55 18.2ZM8 22L9 15H4L13 2H15L14 10H20L10 22H8Z" fill={fill} />
            </G>
        </Svg>

    )
}