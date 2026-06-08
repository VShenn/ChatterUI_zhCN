import { AntDesign } from '@expo/vector-icons'
import { Text, View } from 'react-native'

import { Theme } from '@lib/theme/ThemeManager'

const ModelEmpty = () => {
    const { color, spacing, fontSize } = Theme.useTheme()
    return (
        <View
            style={{
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1,
            }}>
            <AntDesign name="file-unknown" size={60} color={color.text._700} />
            <Text
                style={{
                    color: color.text._700,
                    marginTop: spacing.xl,
                    fontStyle: 'italic',
                    fontSize: fontSize.l,
                }}>
                未找到模型。尝试导入一些吧！
            </Text>
        </View>
    )
}

export default ModelEmpty