import { usePathname, useRouter } from 'expo-router'
import { ReactNode } from 'react'
import { View } from 'react-native'

import Alert from '@components/views/Alert'
import ContextMenu from '@components/views/ContextMenu'
import { CharInfo, Characters } from '@lib/state/Characters'
import { Chats } from '@lib/state/Chat'
import { Logger } from '@lib/state/Logger'

type CharacterEditPopupProps = {
    character: CharInfo
    nowLoading: boolean
    setNowLoading: (b: boolean) => void
    children: ReactNode
}

const CharacterEditPopup: React.FC<CharacterEditPopupProps> = ({
    character,
    setNowLoading,
    nowLoading,
    children,
}) => {
    const path = usePathname()
    const router = useRouter()

    const { loadChat } = Chats.useChat()

    const setCurrentCharacter = async () => {
        if (nowLoading || path === '/screens/ChatScreen' || !character.id) return
        try {
            setNowLoading(true)
            await setCurrentCard(character.id)
            let chatId = character.latestChat
            if (!chatId) {
                chatId = await Chats.db.mutate.createChat(character.id)
            }
            if (!chatId) {
                Logger.errorToast('聊天创建备份失败！请报告此问题。')
                return
            }
            await loadChat(chatId)
            setNowLoading(false)
            router.push('/screens/ChatScreen')
        } catch (error) {
            Logger.errorToast(`无法加载角色：${error}`)
            setNowLoading(false)
        }
    }

    const setCurrentCard = Characters.useCharacterStore((state) => state.setCard)

    const deleteCard = (close: () => void) => {
        close()
        Alert.alert({
            title: '删除角色',
            description: `确定要删除“${character.name}”吗？\n此操作不可撤销。`,
            buttons: [
                {
                    label: '取消',
                },
                {
                    label: '删除角色',
                    onPress: async () => {
                        Characters.db.mutate.deleteCard(character.id ?? -1)
                    },
                    type: 'warning',
                },
            ],
        })
    }

    const cloneCard = (close: () => void) => {
        close()
        Alert.alert({
            title: '克隆角色',
            description: `确定要克隆“${character.name}”吗？`,
            buttons: [
                {
                    label: '取消',
                },
                {
                    label: '克隆角色',
                    onPress: async () => {
                        setNowLoading(true)
                        await Characters.db.mutate.duplicateCard(character.id)

                        setNowLoading(false)
                    },
                },
            ],
        })
    }

    const editCharacter = async (close: () => void) => {
        if (nowLoading) return
        setNowLoading(true)
        await setCurrentCard(character.id)
        setNowLoading(false)
        close()
        router.push('/screens/CharacterEditorScreen')
    }

    return (
        <ContextMenu
            disabled={nowLoading || path !== '/'}
            onPress={setCurrentCharacter}
            longPress
            delayLongPress={300}
            buttons={[
                { label: '编辑', icon: 'edit', onPress: editCharacter },
                { label: '克隆', icon: 'copy', onPress: cloneCard },
                { label: '删除', icon: 'delete', onPress: deleteCard, variant: 'warning' },
            ]}
            placement="center">
            <View pointerEvents="none">{children}</View>
        </ContextMenu>
    )
}

export default CharacterEditPopup