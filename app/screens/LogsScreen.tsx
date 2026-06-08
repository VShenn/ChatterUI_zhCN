import { FlashList } from '@shopify/flash-list'
import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useShallow } from 'zustand/react/shallow'

import Alert from '@components/views/Alert'
import ContextMenu from '@components/views/ContextMenu'
import HeaderButton from '@components/views/HeaderButton'
import HeaderTitle from '@components/views/HeaderTitle'
import { Logger, LogLevel } from '@lib/state/Logger'
import { Theme } from '@lib/theme/ThemeManager'
import { saveStringToDownload } from '@lib/utils/File'

const LogsScreen = () => {
    const { color } = Theme.useTheme()
    const { logs, flushLogs } = Logger.useLoggerStore(
        useShallow((state) => ({
            logs: state.logs,
            flushLogs: state.flushLogs,
        }))
    )

    const handleExportLogs = () => {
        if (!logs) return
        const data = logs
            .map((item) => `${Logger.LevelName[item.level]} ${item.timestamp}: ${item.message}`)
            .join('\n')
        saveStringToDownload(data, `logs-chatterui-${Date.now()}.txt`, 'utf8')
            .then(() => {
                Logger.infoToast('日志已下载！')
            })
            .catch((e) => {
                Logger.errorToast(`无法导出日志：${e}`)
            })
    }

    const handleFlushLogs = () => {
        Alert.alert({
            title: `删除日志`,
            description: `确定要删除所有日志吗？此操作不可撤销。`,
            buttons: [
                { label: '取消' },
                {
                    label: '删除日志',
                    onPress: async () => {
                        flushLogs()
                    },
                    type: 'warning',
                },
            ],
        })
    }

    const logColor: Record<LogLevel, string> = {
        [LogLevel.INFO]: 'white',
        [LogLevel.WARN]: 'yellow',
        [LogLevel.ERROR]: 'red',
        [LogLevel.DEBUG]: 'gray',
    }

    const headerRight = () => (
        <ContextMenu
            placement="bottom"
            triggerIcon="setting"
            buttons={[
                {
                    label: '导出日志',
                    icon: 'export',
                    onPress: (close) => {
                        handleExportLogs()
                        close()
                    },
                },
                {
                    label: '清空日志',
                    icon: 'delete',
                    onPress: (close) => {
                        handleFlushLogs()
                        close()
                    },
                    variant: 'warning',
                },
            ]}
        />
    )

    return (
        <SafeAreaView
            edges={['bottom']}
            style={{
                flex: 1,
            }}>
            <HeaderTitle title="日志" />
            <HeaderButton headerRight={headerRight} />
            <View
                style={{
                    borderColor: color.primary._500,
                    borderWidth: 1,
                    borderRadius: 16,
                    flex: 1,
                    margin: 16,
                    backgroundColor: '#000',

                    padding: 16,
                }}>
                <FlashList
                    maintainVisibleContentPosition={{ startRenderingFromBottom: true }}
                    data={logs}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <Text
                            style={{
                                fontSize: 12,
                                color: logColor[item.level],
                            }}>
                            {Logger.LevelName[item.level]} {item.timestamp}: {item.message}
                        </Text>
                    )}
                />
            </View>
        </SafeAreaView>
    )
}

export default LogsScreen