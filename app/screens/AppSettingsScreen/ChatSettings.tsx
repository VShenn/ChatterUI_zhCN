import { useTextIntentStatus } from '@vali98/react-native-process-text'
import { useRouter } from 'expo-router'
import React from 'react'
import { View } from 'react-native'
import { useMMKVBoolean } from 'react-native-mmkv'

import ThemedButton from '@components/buttons/ThemedButton'
import ThemedSwitch from '@components/input/ThemedSwitch'
import SectionTitle from '@components/text/SectionTitle'
import { AppSettings } from '@lib/constants/GlobalValues'

const ChatSettings = () => {
    const [firstMes, setFirstMes] = useMMKVBoolean(AppSettings.CreateFirstMes)
    const [chatOnStartup, setChatOnStartup] = useMMKVBoolean(AppSettings.ChatOnStartup)
    const [autoLoadUser, setAutoLoadUser] = useMMKVBoolean(AppSettings.AutoLoadUser)
    const [autoTitle, setAutoTitle] = useMMKVBoolean(AppSettings.AutoGenerateTitle)
    const { enabled: textIntent, setEnabled: setTextIntent } = useTextIntentStatus()
    const router = useRouter()
    return (
        <View style={{ rowGap: 8 }}>
            <SectionTitle>聊天</SectionTitle>

            <ThemedSwitch
                label="使用第一条消息"
                value={firstMes}
                onChangeValue={setFirstMes}
                description="禁用后，新聊天将以空白开始，某些模型需要此设置"
            />

            <ThemedSwitch
                label="启动时加载聊天"
                value={chatOnStartup}
                onChangeValue={setChatOnStartup}
                description="启动时加载最近的聊天记录"
            />

            <ThemedSwitch
                label="自动加载用户"
                value={autoLoadUser}
                onChangeValue={setAutoLoadUser}
                description="打开聊天时，自动加载与该聊天关联的用户"
            />

            <ThemedSwitch
                label="自动生成标题"
                value={autoTitle}
                onChangeValue={setAutoTitle}
                description="自动为聊天生成标题（仅限远程模式）"
            />

            <ThemedSwitch
                label="在 ChatterUI 中询问"
                value={textIntent}
                onChangeValue={setTextIntent}
                description="选中文本时将 ChatterUI 添加为搜索选项"
            />

            <ThemedButton
                label="聊天样式"
                variant="secondary"
                onPress={() => router.push('/screens/AppSettingsScreen/ChatStyleSettings')}
            />
        </View>
    )
}

export default ChatSettings