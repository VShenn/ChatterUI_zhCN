import React from 'react'
import { View } from 'react-native'
import { useMMKVBoolean } from 'react-native-mmkv'

import ThemedSwitch from '@components/input/ThemedSwitch'
import SectionTitle from '@components/text/SectionTitle'
import { AppSettings } from '@lib/constants/GlobalValues'

const ChatWindowSettings = () => {
    const [autoScroll, setAutoScroll] = useMMKVBoolean(AppSettings.AutoScroll)
    const [sendOnEnter, setSendOnEnter] = useMMKVBoolean(AppSettings.SendOnEnter)
    const [quickDelete, setQuickDelete] = useMMKVBoolean(AppSettings.QuickDelete)
    const [saveScroll, setSaveScroll] = useMMKVBoolean(AppSettings.SaveScrollPosition)
    const [alternate, setAlternate] = useMMKVBoolean(AppSettings.AlternatingChatMode)
    const [wide, setWide] = useMMKVBoolean(AppSettings.WideChatMode)

    const [showTokensPerSecond, setShowTokensPerSecond] = useMMKVBoolean(
        AppSettings.ShowTokenPerSecond
    )

    return (
        <View style={{ rowGap: 8 }}>
            <SectionTitle>聊天窗口</SectionTitle>

            <ThemedSwitch
                label="自动滚动"
                value={autoScroll}
                onChangeValue={setAutoScroll}
                description="生成时自动滚动文本"
            />

            <ThemedSwitch
                label="回车发送"
                value={sendOnEnter}
                onChangeValue={setSendOnEnter}
                description="按下回车时发送消息"
            />

            <ThemedSwitch
                label="显示每秒令牌数"
                value={showTokensPerSecond}
                onChangeValue={setShowTokensPerSecond}
                description="使用本地模型时显示每秒生成的令牌数"
            />

            <ThemedSwitch
                label="快速删除"
                value={quickDelete}
                onChangeValue={setQuickDelete}
                description="在聊天选项栏中显示删除按钮"
            />

            <ThemedSwitch
                label="保存滚动位置"
                value={saveScroll}
                onChangeValue={setSaveScroll}
                description="自动恢复到聊天中上次滚动到的位置"
            />

            <ThemedSwitch
                label="宽屏聊天"
                value={wide}
                onChangeValue={setWide}
                description="移除空白区域，使聊天区域更宽"
            />

            <ThemedSwitch
                label="交替显示用户和角色位置"
                value={alternate}
                onChangeValue={setAlternate}
                description="角色聊天左对齐，用户聊天右对齐"
            />
        </View>
    )
}

export default ChatWindowSettings