import React from 'react'
import { View } from 'react-native'
import { useMMKVBoolean } from 'react-native-mmkv'

import ThemedSwitch from '@components/input/ThemedSwitch'
import SectionTitle from '@components/text/SectionTitle'
import { AppSettings } from '@lib/constants/GlobalValues'

const SecuritySettings = () => {
    const [authLocal, setAuthLocal] = useMMKVBoolean(AppSettings.LocallyAuthenticateUser)
    return (
        <View style={{ rowGap: 8 }}>
            <SectionTitle>安全</SectionTitle>
            <ThemedSwitch
                label="锁定应用"
                value={authLocal}
                onChangeValue={setAuthLocal}
                description="打开应用时需要用户身份验证。如果没有启用设备锁，此功能将无效。"
            />
        </View>
    )
}

export default SecuritySettings