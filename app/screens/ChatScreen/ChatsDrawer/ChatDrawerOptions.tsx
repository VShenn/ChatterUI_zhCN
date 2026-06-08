import React, { ReactNode, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

import Alert from '@components/views/Alert'
import ContextMenu from '@components/views/ContextMenu'
import InputSheet from '@components/views/InputSheet'
import { Characters } from '@lib/state/Characters'
import { Chats } from '@lib/state/Chat'
import { Logger } from '@lib/state/Logger'
import { saveStringToDownload } from '@lib/utils/File'

type ChatEditPopupProps = {
    item: Awaited<ReturnType<typeof Chats.db.query.chatListQuery>>[0]
    children: ReactNode
    onPress: () => void
}

const ChatEditPopup: React.FC<ChatEditPopupProps> = ({ item, children, onPress }) => {
    const [showRename, setShowRename] = useState<boolean>(false)

    const { charName, charId } = Characters.useCharacterStore(
        useShallow((state) => ({
            charId: state.id,
            charName: state.card?.name ?? '未知',
        }))
    )

    const { userId, userName } = Characters.useUserStore(
        useShallow((state) => ({
            userId: state.id,
            userName: state.card?.name,
        }))
    )

    const { deleteChat, loadChat, chatId, unloadChat } = Chats.useChat()

    const handleDeleteChat = (close: () => void) => {
        Alert.alert({
            title: `删除聊天`,
            description: `确定要删除“${item.name}”吗？此操作不可撤销。`,
            buttons: [
                { label: '取消' },
                {
                    label: '删除聊天',
                    onPress: async () => {
                        await deleteChat(item.id)
                        if (charId && chatId === item.id) {
                            const returnedChatId = await Chats.db.query.chatNewestId(charId)
                            const chatId = returnedChatId
                                ? returnedChatId
                                : await Chats.db.mutate.createChat(charId)
                            chatId && (await loadChat(chatId))
                        } else if (item.id === chatId) {
                            Logger.errorToast(`创建默认聊天时出现问题`)
                            unloadChat()
                        }
                        close()
                    },
                    type: 'warning',
                },
            ],
        })
    }

    const handleCloneChat = (close: () => void) => {
        Alert.alert({
            title: `克隆聊天`,
            description: `确定要克隆“${item.name}”吗？`,
            buttons: [
                { label: '取消' },
                {
                    label: '克隆聊天',
                    onPress: async () => {
                        await Chats.db.mutate.cloneChatFromId(item.id)
                        close()
                    },
                },
            ],
        })
    }

    const handleExportChat = async (close: () => void) => {
        const name = `Chatlogs-${charName}-${item.id}.json`.replaceAll(' ', '_')
        const chat = await Chats.db.query.chat(item.id)
        if (chat) {
            try {
                await saveStringToDownload(JSON.stringify(chat), name, 'utf8')
                Logger.infoToast(`文件：${name} 已保存到下载文件夹！`)
            } catch (e) {
                Logger.errorToast('导出聊天失败')
                Logger.error(`${e}`)
            }
        } else {
            Logger.errorToast('聊天记录未定义')
        }
        close()
    }

    const handleLinkUser = async (close: () => void) => {
        if (userId === item.user_id) {
            Logger.warnToast('此用户已关联')
            close()
            return
        }
        if (!userId) {
            Logger.errorToast('没有当前用户')
            close()
            return
        }
        await Chats.db.mutate.updateUser(item.id, userId)
        Logger.infoToast(`已关联用户：${userName}`)
        close()
    }

    return (
        <>
            <InputSheet
                title="重命名聊天"
                visible={showRename}
                setVisible={setShowRename}
                onConfirm={async (text) => {
                    await Chats.db.mutate.renameChat(item.id, text)
                }}
                verifyText={(text) => (text.length === 0 ? '名称不能为空' : '')}
                defaultValue={item.name}
            />
            <ContextMenu
                placement="right"
                longPress
                onPress={onPress}
                buttons={[
                    {
                        label: '重命名',
                        icon: 'edit',
                        onPress: (close) => {
                            setShowRename(true)
                            close()
                        },
                    },
                    {
                        label: '删除',
                        icon: 'delete',
                        variant: 'warning',
                        onPress: handleDeleteChat,
                    },
                    {
                        label: '更多',
                        submenu: [
                            {
                                label: '导出',
                                icon: 'download',
                                onPress: handleExportChat,
                            },
                            {
                                label: '克隆',
                                icon: 'copy',
                                onPress: handleCloneChat,
                            },
                            {
                                label: '关联用户',
                                icon: 'user',
                                onPress: handleLinkUser,
                            },
                        ],
                    },
                ]}>
                {children}
            </ContextMenu>
        </>
    )
}

export default ChatEditPopup