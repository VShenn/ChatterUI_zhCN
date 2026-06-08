import { View } from 'react-native'

import ThemedButton from '@components/buttons/ThemedButton'
import SectionTitle from '@components/text/SectionTitle'
import Alert from '@components/views/Alert'
import { Characters } from '@lib/state/Characters'

import TagHiderSettings from './TagHiderSettings'

const CharacterSettings = () => {
    return (
        <View style={{ rowGap: 8 }}>
            <SectionTitle>角色管理</SectionTitle>
            <ThemedButton
                label="重新生成默认角色卡"
                variant="secondary"
                onPress={() => {
                    Alert.alert({
                        title: `重新生成默认角色卡`,
                        description: `这将在您的角色列表中添加默认的 AI 机器人卡。`,
                        buttons: [
                            { label: '取消' },
                            {
                                label: '创建默认角色卡',
                                onPress: async () => await Characters.createDefaultCard(),
                            },
                        ],
                    })
                }}
            />
            <TagHiderSettings />
        </View>
    )
}

export default CharacterSettings