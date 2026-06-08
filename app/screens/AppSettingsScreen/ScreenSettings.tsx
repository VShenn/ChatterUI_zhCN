import * as KeepAwake from 'expo-keep-awake'
import React from 'react'
import { View } from 'react-native'
import { useMMKVBoolean } from 'react-native-mmkv'

import ThemedSwitch from '@components/input/ThemedSwitch'
import SectionTitle from '@components/text/SectionTitle'
import { AppSettings } from '@lib/constants/GlobalValues'

const ScreenSettings = () => {
    const [unlockOrientation, setUnlockOrientation] = useMMKVBoolean(AppSettings.UnlockOrientation)
    const [keepAwake, setKeepAwake] = useMMKVBoolean(AppSettings.KeepAwake)
    return (
        <View style={{ rowGap: 8 }}>
            <SectionTitle>屏幕</SectionTitle>
            <ThemedSwitch
                label="解锁方向"
                description="允许手机横屏（需要重启应用）"
                value={unlockOrientation}
                onChangeValue={setUnlockOrientation}
            />

            <ThemedSwitch
                label="保持唤醒"
                description="应用在前台时保持屏幕常亮"
                value={keepAwake}
                onChangeValue={(value) => {
                    setKeepAwake(value)
                    if (value) KeepAwake.activateKeepAwakeAsync()
                    else KeepAwake.deactivateKeepAwake()
                }}
            />
        </View>
    )
}

export default ScreenSettings