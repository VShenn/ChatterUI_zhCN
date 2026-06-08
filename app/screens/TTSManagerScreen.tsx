import * as Speech from 'expo-speech'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'

import ThemedButton from '@components/buttons/ThemedButton'
import DropdownSheet from '@components/input/DropdownSheet'
import ThemedSlider from '@components/input/ThemedSlider'
import ThemedSwitch from '@components/input/ThemedSwitch'
import ThemedTextInput from '@components/input/ThemedTextInput'
import SectionTitle from '@components/text/SectionTitle'
import HeaderTitle from '@components/views/HeaderTitle'
import { Logger } from '@lib/state/Logger'
import { useTTS } from '@lib/state/TTS'
import { Theme } from '@lib/theme/ThemeManager'
import { groupBy } from '@lib/utils/Array'

type LanguageListItem = {
    [key: string]: Speech.Voice[]
}

const TTSManagerScreen = () => {
    const { color } = Theme.useTheme()
    const { voice, setVoice, enabled, setEnabled, auto, setAuto, rate, setRate, live, setLive } =
        useTTS()
    const [lang, setLang] = useState(voice?.language ?? 'en-US')
    const [modelList, setModelList] = useState<Speech.Voice[]>([])
    const languageList: LanguageListItem = groupBy(modelList, 'language')
    const [testAudioText, setTestAudioText] = useState('这是一个测试音频')

    const languages = Object.keys(languageList)
        .sort()
        .map((name) => {
            return name
        })

    useEffect(() => {
        getVoices()
    }, [])

    const getVoices = (value = false) => {
        Speech.getAvailableVoicesAsync().then((list) => setModelList(list))
    }

    return (
        <KeyboardAwareScrollView
            style={{
                marginVertical: 16,
                paddingVertical: 16,
                paddingHorizontal: 16,
            }}
            contentContainerStyle={{ rowGap: 8 }}>
            <HeaderTitle title="TTS" />
            <SectionTitle>设置</SectionTitle>

            <ThemedSwitch
                label="启用"
                value={enabled}
                onChangeValue={(value) => {
                    if (value) {
                        getVoices(true)
                    } else Speech.stop()
                    setEnabled(value)
                }}
            />
            <ThemedSwitch
                value={auto}
                onChangeValue={(value) => {
                    if (value) {
                        setLive(false)
                    }
                    setAuto(value)
                }}
                label="推理后自动 TTS"
            />

            <ThemedSwitch
                value={live}
                onChangeValue={(value) => {
                    if (value) {
                        setAuto(false)
                    }
                    setLive(value)
                }}
                label="推理期间实时 TTS"
            />

            <ThemedSlider
                label="语速"
                min={0.1}
                max={2.5}
                step={0.1}
                precision={1}
                value={rate}
                onValueChange={setRate}
            />

            <SectionTitle style={{ marginTop: 8 }}>
                语言 ({Object.keys(languageList).length})
            </SectionTitle>
            <View style={{ marginTop: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 8 }}>
                    <DropdownSheet
                        containerStyle={{ flex: 1 }}
                        selected={lang}
                        data={languages}
                        labelExtractor={(item) => item}
                        placeholder="选择语言"
                        onChangeValue={(item) => setLang(item)}
                    />
                    <ThemedButton
                        iconName="reload"
                        iconSize={20}
                        onPress={() => getVoices()}
                        variant="secondary"
                    />
                </View>
            </View>

            <SectionTitle style={{ marginTop: 8 }}>
                语音 ({modelList.filter((item) => item.language === lang).length})
            </SectionTitle>

            <DropdownSheet
                style={{ marginBottom: 8 }}
                search
                modalTitle="选择语音"
                selected={voice}
                data={languageList?.[lang] ?? []}
                labelExtractor={(item) => item.identifier}
                placeholder="选择语音"
                onChangeValue={(item) => setVoice(item)}
            />
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    columnGap: 8,
                    backgroundColor: color.neutral._100,
                }}>
                <ThemedTextInput
                    value={testAudioText}
                    onChangeText={setTestAudioText}
                    style={{ color: color.text._400, fontStyle: 'italic' }}
                />
                <ThemedButton
                    label="测试"
                    variant="secondary"
                    onPress={() => {
                        if (voice === undefined) {
                            Logger.warnToast(`未选择语音`)
                            return
                        }
                        Speech.speak(testAudioText, {
                            language: voice.language,
                            voice: voice.identifier,
                            rate: rate,
                        })
                    }}
                />
            </View>
        </KeyboardAwareScrollView>
    )
}

export default TTSManagerScreen