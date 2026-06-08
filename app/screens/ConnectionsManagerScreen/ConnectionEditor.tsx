import { useCallback, useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useShallow } from 'zustand/react/shallow'

import HeartbeatButton from '@components/buttons/HeartbeatButton'
import ThemedButton from '@components/buttons/ThemedButton'
import DropdownSheet from '@components/input/DropdownSheet'
import MultiDropdownSheet from '@components/input/MultiDropdownSheet'
import ThemedTextInput from '@components/input/ThemedTextInput'
import BottomSheet from '@components/views/BottomSheet'
import { CLAUDE_VERSION } from '@lib/constants/GlobalValues'
import { APIConfiguration } from '@lib/engine/API/APIBuilder.types'
import { APIManager, APIManagerValue } from '@lib/engine/API/APIManagerState'
import { Logger } from '@lib/state/Logger'
import { Theme } from '@lib/theme/ThemeManager'
import { getNestedValue } from '@lib/utils/Parsing'

type ConnectionEditorProps = {
    index: number
    show: boolean
    close: () => void
    originalValues: APIManagerValue
}

const ConnectionEditor: React.FC<ConnectionEditorProps> = ({
    index,
    show,
    close,
    originalValues,
}) => {
    const { color, fontSize } = Theme.useTheme()
    const styles = useStyles()

    const { editValue, getTemplates } = APIManager.useConnectionsStore(
        useShallow((state) => ({
            getTemplates: state.getTemplates,
            editValue: state.editValue,
        }))
    )

    const [template, setTemplate] = useState<APIConfiguration>(getTemplates()[0])

    const [values, setValues] = useState<APIManagerValue>(originalValues)
    const [modelList, setModelList] = useState<any[]>([])

    useEffect(() => {
        const newTemplate = getTemplates().find((item) => item.name === values.configName)
        if (!newTemplate) {
            Logger.errorToast('无法获取有效的模板！')
            close()
            return
        }

        setTemplate(newTemplate)
    }, [close, values, getTemplates])

    const handleGetModelList = useCallback(async () => {
        if (!template.features.useModel || !show) return
        const auth: any = {}
        if (template.features.useKey) {
            auth[template.request.authHeader] = template.request.authPrefix + values.key
            if (template.name === 'Claude') {
                auth['anthropic-version'] = CLAUDE_VERSION
            }
        }
        const result = await fetch(values.modelEndpoint, { headers: { ...auth } })
        const data = await result.json()
        if (result.status !== 200) {
            Logger.error(`无法获取模型：${data?.error?.message}`)
            return
        }
        const models = getNestedValue(data, template.model.modelListParser)
        setModelList(models)
    }, [show, template, values])
    // TODO: Replace with react query
    useEffect(() => {
        setValues(originalValues)
        handleGetModelList()
    }, [originalValues, handleGetModelList])

    return (
        <BottomSheet
            sheetStyle={{ flex: 2 }}
            visible={show}
            onClose={close}
            setVisible={(v) => {
                if (v) return
                close()
            }}>
            <View style={styles.mainContainer}>
                <Text
                    style={{
                        color: color.text._100,
                        fontSize: fontSize.xl2,
                        fontWeight: '500',
                        paddingBottom: 16,
                    }}>
                    编辑连接
                </Text>

                <ScrollView
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ rowGap: 12, paddingBottom: 32 }}>
                    <ThemedTextInput
                        label="友好名称"
                        value={values.friendlyName}
                        onChangeText={(value) => {
                            setValues({ ...values, friendlyName: value })
                        }}
                    />

                    {template.ui.editableCompletionPath && (
                        <View>
                            <ThemedTextInput
                                label="补全 URL"
                                value={values.endpoint}
                                onChangeText={(value) => {
                                    setValues({ ...values, endpoint: value })
                                }}
                            />
                            <Text style={styles.hintText}>注意：使用完整的 URL 路径</Text>
                        </View>
                    )}

                    {template.ui.editableModelPath && (
                        <View>
                            <ThemedTextInput
                                label="模型 URL"
                                value={values.modelEndpoint}
                                onChangeText={(value) => {
                                    setValues({ ...values, modelEndpoint: value })
                                }}
                            />
                            <HeartbeatButton
                                api={values.modelEndpoint ?? ''}
                                apiFormat={(s) => s}
                                headers={
                                    template.features.useKey
                                        ? {
                                              [template.request.authHeader]:
                                                  template.request.authPrefix + values.key,
                                          }
                                        : {}
                                }
                                callback={handleGetModelList}
                            />
                        </View>
                    )}

                    {template.features.useKey && (
                        <ThemedTextInput
                            secureTextEntry
                            label="API 密钥"
                            value={values.key}
                            onChangeText={(value) => {
                                setValues({ ...values, key: value })
                            }}
                        />
                    )}

                    {template.features.useModel && (
                        <View style={{ rowGap: 4 }}>
                            <Text style={styles.title}>模型</Text>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    columnGap: 8,
                                }}>
                                {!template.features.multipleModels && (
                                    <DropdownSheet
                                        containerStyle={{ flex: 1 }}
                                        selected={values.model}
                                        data={modelList}
                                        labelExtractor={(value) => {
                                            return getNestedValue(value, template.model.nameParser)
                                        }}
                                        onChangeValue={(item) => {
                                            setValues({ ...values, model: item })
                                        }}
                                        search={modelList.length > 10}
                                        modalTitle="选择模型"
                                    />
                                )}
                                {template.features.multipleModels && (
                                    <MultiDropdownSheet
                                        containerStyle={{ flex: 1 }}
                                        selected={values?.model ?? []}
                                        data={modelList}
                                        labelExtractor={(value) => {
                                            return getNestedValue(value, template.model.nameParser)
                                        }}
                                        onChangeValue={(item) => {
                                            setValues({ ...values, model: item })
                                        }}
                                        search={modelList.length > 10}
                                        modalTitle="选择模型"
                                    />
                                )}
                                <ThemedButton
                                    onPress={() => {
                                        handleGetModelList()
                                    }}
                                    iconName="reload"
                                    iconSize={18}
                                    variant="secondary"
                                />
                            </View>
                        </View>
                    )}

                    {template.features.useFirstMessage && (
                        <View>
                            <ThemedTextInput
                                label="第一条消息"
                                value={values.firstMessage}
                                onChangeText={(value) => {
                                    setValues({ ...values, firstMessage: value })
                                }}
                            />
                            <Text style={styles.hintText}>
                                发送给 Claude 的默认第一条消息
                            </Text>
                        </View>
                    )}
                    {template.features.usePrefill && (
                        <View>
                            <ThemedTextInput
                                label="预填充"
                                value={values.prefill}
                                onChangeText={(value) => {
                                    setValues({ ...values, prefill: value })
                                }}
                            />
                            <Text style={styles.hintText}>模型回复前的预填充文本</Text>
                        </View>
                    )}
                </ScrollView>
                <ThemedButton
                    label="保存更改"
                    onPress={() => {
                        editValue(values, index)
                        close()
                    }}
                />
            </View>
        </BottomSheet>
    )
}

export default ConnectionEditor

const useStyles = () => {
    const { color, spacing } = Theme.useTheme()
    return StyleSheet.create({
        mainContainer: {
            flex: 1,
        },

        title: {
            color: color.text._100,
        },

        hintText: {
            paddingTop: spacing.s,
            color: color.text._400,
        },
    })
}