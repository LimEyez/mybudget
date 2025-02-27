import Svg, { G, Mask, Path, Rect } from "react-native-svg";

export default function Trashcan({ width = '24', height = '24', fill = '#D9D9D9' }: { width?: string, height?: string, fill?: string }) {
    return (
        <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" >
            <Mask id="mask0_569_282" style={{maskType: "alpha"}} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                <Rect width={'24'} height={'24'} fill={fill} />
            </Mask>
            <G mask="url(#mask0_569_282)">
                <Path d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6H4V4H9V3H15V4H20V6H19V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM17 6H7V19H17V6ZM9 17H11V8H9V17ZM13 17H15V8H13V17Z" fill={fill} />
            </G>
        </Svg>

    )
}