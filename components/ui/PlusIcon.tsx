import Svg, { G, Path } from "react-native-svg"
export default function PlusIcon({ width = "20", height = "20", fill = "#D9D9D9", stroke = "#FFFFFF", strokeWidth = "1" }: { width?: string, height?: string, fill?: string, stroke?: string, strokeWidth?: string }) {
    return (
        <Svg width={width} height={height} viewBox="0 0 32 32">
            <G id="Page-2-Copy" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <G id="51" stroke={stroke} fill={fill}>
                    <Path d="M15,15 L0.992786407,15 C0.444485615,15 0,15.4438648 0,16 C0,16.5522847 0.452362061,17 0.992786407,17 L15,17 L15,31.0072136 C15,31.5555144 15.4438648,32 16,32 C16.5522847,32 17,31.5476379 17,31.0072136 L17,17 L31.0072136,17 C31.5555144,17 32,16.5561352 32,16 C32,15.4477153 31.5476379,15 31.0072136,15 L17,15 L17,0.992786407 C17,0.444485615 16.5561352,-8.15366451e-17 16,-1.8369702e-16 C15.4477153,-2.85150083e-16 15,0.452362061 15,0.992786407 L15,15 Z" id="Rectangle-458" stroke="none"></Path>
                </G>
            </G>
        </Svg>

    )
}