import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

import ContextMenu from '@components/views/ContextMenu'
import InputSheet from '@components/views/InputSheet'
import { Characters } from '@lib/state/Characters'
import { Logger } from '@lib/state/Logger'

type CharacterNewMenuProps = {
    nowLoading: boolean
    setNowLoading: (b: boolean) => void
}

const CharacterNewMenu: React.FC<CharacterNewMenuProps> = ({ nowLoading, setNowLoading }) => {
    const { setCurrentCard } = Characters.useCharacterStore(
        useShallow((state) => ({
            setCurrentCard: state.setCard,
            id: state.id,
        }))
    )

    const router = useRouter()
    const [showNewChar, setShowNewChar] = useState<boolean>(false)

    const handleCreateCharacter = async (text: string) => {
        if (!text) {
            Logger.errorToast('名称不能为空！')
            return
        }
        Characters.db.mutate.createCard(text).then(async (id) => {
            if (nowLoading) return
            setNowLoading(true)
            await setCurrentCard(id)
            setNowLoading(false)
            router.push('/screens/CharacterEditorScreen')
        })
    }

    return (
        <>
            <InputSheet
                visible={showNewChar}
                setVisible={setShowNewChar}
                title="创建新角色"
                onConfirm={handleCreateCharacter}
                verifyText={(text) => (text.length === 0 ? '名称不能为空' : '')}
                placeholder="名称..."
                autoFocus
            />

            <ContextMenu
                triggerIcon="user-add"
                buttons={[
                    {
                        label: '从文件导入',
                        onPress: (close) => {
                            Characters.importCharacter()
                            close()
                        },
                        icon: 'upload',
                    },
                    {
                        label: '创建角色',
                        onPress: (close) => {
                            setShowNewChar(true)
                            close()
                        },
                        icon: 'edit',
                    },
                ]}
                placement="bottom"
            />
        </>
    )
}

export default CharacterNewMenu