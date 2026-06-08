import React from 'react'
import { View } from 'react-native'
import { useMMKVBoolean } from 'react-native-mmkv'

import ThemedSwitch from '@components/input/ThemedSwitch'
import SectionTitle from '@components/text/SectionTitle'
import { AppSettings } from '@lib/constants/GlobalValues'
import { registerForPushNotificationsAsync } from '@lib/notifications/Notifications'

const NotificationSettings = () => {
    const [notificationOnGenerate, setNotificationOnGenerate] = useMMKVBoolean(
        AppSettings.NotifyOnComplete
    )
    const [notificationSound, setNotificationSound] = useMMKVBoolean(
        AppSettings.PlayNotificationSound
    )
    const [notificationVibrate, setNotificationVibrate] = useMMKVBoolean(
        AppSettings.VibrateNotification
    )
    const [showNotificationText, setShowNotificationText] = useMMKVBoolean(
        AppSettings.ShowNotificationText
    )

    return (
        <View>
            <SectionTitle>通知</SectionTitle>
            <ThemedSwitch
                label="启用通知"
                value={notificationOnGenerate}
                onChangeValue={async (value) => {
                    if (!value) {
                        setNotificationOnGenerate(false)
                        return
                    }

                    const granted = await registerForPushNotificationsAsync()
                    if (granted) {
                        setNotificationOnGenerate(true)
                    }
                }}
                description="应用在后台时发送通知"
            />
            {notificationOnGenerate && (
                <View>
                    <ThemedSwitch
                        label="通知声音"
                        value={notificationSound}
                        onChangeValue={setNotificationSound}
                        description=""
                    />

                    <ThemedSwitch
                        label="通知震动"
                        value={notificationVibrate}
                        onChangeValue={setNotificationVibrate}
                        description=""
                    />

                    <ThemedSwitch
                        label="在通知中显示文本"
                        value={showNotificationText}
                        onChangeValue={setShowNotificationText}
                        description="在通知中显示生成的消息内容"
                    />
                </View>
            )}
        </View>
    )
}

export default NotificationSettings