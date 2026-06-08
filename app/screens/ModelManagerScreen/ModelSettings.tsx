import { useFocusEffect } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { BackHandler, Platform, View } from 'react-native'
import { useMMKVBoolean, useMMKVNumber } from 'react-native-mmkv'
import Animated, { Easing, SlideInRight, SlideOutRight } from 'react-native-reanimated'
import { useShallow } from 'zustand/react/shallow'

import ThemedButton from '@components/buttons/ThemedButton'
import HorizontalSelector from '@components/input/HorizontalSelector'
import ThemedSlider from '@components/input/ThemedSlider'
import ThemedSwitch from '@components/input/ThemedSwitch'
import SectionTitle from '@components/text/SectionTitle'
import Alert from '@components/views/Alert'
import { AppSettings, Global } from '@lib/constants/GlobalValues'
import { Llama } from '@lib/engine/Local/LlamaLocal'
import { KV } from '@lib/engine/Local/Model'
import useBackendDevices from '@lib/hooks/BackendDevices'
import { Logger } from '@lib/state/Logger'
import { readableFileSize } from '@lib/utils/File'

type ModelSettingsProp = {
    modelImporting: boolean
    modelLoading: boolean
    exit: () => void
}

const deviceLabels = { GPUOpenCL: 'OpenCL', HTP0: 'Hexagon', CPU: 'CPU' }

const ModelSettings: React.FC<ModelSettingsProp> = ({ modelImporting, modelLoading, exit }) => {
    const { config, setConfig } = Llama.useLlamaPreferencesStore(
        useShallow((state) => ({
            config: state.config,
            setConfig: state.setConfiguration,
        }))
    )

    const devices = useBackendDevices()

    const [saveKV, setSaveKV] = useMMKVBoolean(AppSettings.SaveLocalKV)
    const [autoloadLocal, setAutoloadLocal] = useMMKVBoolean(AppSettings.AutoLoadLocal)
    const [showModelInChat, setShowModelInChat] = useMMKVBoolean(AppSettings.ShowModelInChat)
    const [threadCount] = useMMKVNumber(Global.CPUThreads)

    const [kvSize, setKVSize] = useState(0)

    const getKVSize = async () => {
        const size = await KV.getKVSize()
        setKVSize(size)
    }

    useEffect(() => {
        getKVSize()
    }, [])

    const backAction = () => {
        exit()
        return true
    }

    useFocusEffect(() => {
        const handler = BackHandler.addEventListener('hardwareBackPress', backAction)
        return () => handler.remove()
    })

    const handleDeleteKV = () => {
        Alert.alert({
            title: '删除 KV 缓存',
            description: `确定要删除 KV 缓存吗？此操作不可撤销。\n\n这将释放 ${readableFileSize(kvSize)} 空间。`,
            buttons: [
                { label: '取消' },
                {
                    label: '删除 KV 缓存',
                    onPress: async () => {
                        await KV.deleteKV()
                        Logger.info('KV 缓存已删除！')
                        getKVSize()
                    },
                    type: 'warning',
                },
            ],
        })
    }

    return (
        <Animated.ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            entering={SlideInRight.easing(Easing.inOut(Easing.cubic))}
            exiting={SlideOutRight.easing(Easing.inOut(Easing.cubic))}>
            <SectionTitle>CPU 设置</SectionTitle>
            <View style={{ marginTop: 16 }} />
            {config && (
                <>
                    <ThemedSlider
                        label="最大上下文"
                        value={config.context_length}
                        onValueChange={(value) => setConfig({ ...config, context_length: value })}
                        min={1024}
                        max={32768}
                        step={1024}
                        disabled={modelImporting || modelLoading}
                    />
                    <ThemedSlider
                        label="线程数"
                        value={config.threads}
                        onValueChange={(value) => setConfig({ ...config, threads: value })}
                        min={1}
                        max={threadCount ?? 8}
                        step={1}
                        disabled={modelImporting || modelLoading}
                    />

                    <ThemedSlider
                        label="批处理大小"
                        value={config.batch}
                        onValueChange={(value) => setConfig({ ...config, batch: value })}
                        min={16}
                        max={1024}
                        step={16}
                        disabled={modelImporting || modelLoading}
                    />

                    {/* Note: llama.rn does not have any Android gpu acceleration */}
                    {(Platform.OS === 'ios' || devices.length > 1) && (
                        <ThemedSlider
                            label="GPU 层数"
                            value={config.gpu_layers}
                            onValueChange={(value) => setConfig({ ...config, gpu_layers: value })}
                            min={0}
                            max={100}
                            step={1}
                            disabled={modelImporting || modelLoading}
                        />
                    )}

                    <ThemedSwitch
                        label="上下文偏移"
                        value={config.ctx_shift}
                        onChangeValue={(value) => {
                            setConfig({ ...config, ctx_shift: value })
                        }}
                    />

                    {devices.length > 1 && (
                        <HorizontalSelector
                            style={{ paddingBottom: 12 }}
                            label="后端设备"
                            values={devices.map((item) => ({
                                label: deviceLabels[item as keyof typeof deviceLabels] ?? item,
                                value: item,
                            }))}
                            selected={config.devices?.[0]}
                            onPress={(value) => {
                                const devices = value === 'CPU' ? [value] : [value, 'CPU']
                                setConfig({ ...config, devices })
                            }}
                        />
                    )}
                </>
            )}
            <SectionTitle>高级设置</SectionTitle>
            <ThemedSwitch
                label="在聊天中显示模型名称"
                value={showModelInChat}
                onChangeValue={setShowModelInChat}
            />
            <ThemedSwitch
                label="启动聊天时自动加载模型"
                value={autoloadLocal}
                onChangeValue={setAutoloadLocal}
            />
            <ThemedSwitch
                label="保存本地 KV 缓存"
                value={saveKV}
                onChangeValue={setSaveKV}
                description={
                    saveKV
                        ? ''
                        : '保存生成时的 KV 缓存，允许您在关闭应用后继续会话。必须使用相同的模型才能正常工作。保存 KV 缓存文件可能非常大，并可能影响电池寿命！'
                }
            />
            {saveKV && (
                <ThemedButton
                    buttonStyle={{ marginTop: 8 }}
                    label={'清除 KV 缓存（' + readableFileSize(kvSize) + '）'}
                    onPress={handleDeleteKV}
                    variant={kvSize === 0 ? 'disabled' : 'critical'}
                />
            )}
        </Animated.ScrollView>
    )
}

export default ModelSettings