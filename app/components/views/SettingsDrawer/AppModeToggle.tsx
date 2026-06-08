import { Platform } from 'react-native'

import HorizontalSelector from '@components/input/HorizontalSelector'
import { useAppMode } from '@lib/state/AppMode'

const AppModeToggle = () => {
    const { appMode, setAppMode } = useAppMode()

    return (
        <HorizontalSelector
            style={{ flex: 0, paddingBottom: 4, paddingHorizontal: 8 }}
            label="应用模式"
            values={[
                {
                    value: 'local',
                    label: '本地',
                    icon: Platform.OS === 'android' ? 'phone-android' : 'phone-iphone',
                },
                { value: 'remote', label: '远程', icon: 'cloud' },
            ]}
            selected={appMode}
            onPress={setAppMode}
        />
    )
}

export default AppModeToggle