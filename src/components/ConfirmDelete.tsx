import { Button, Group, Modal, Text } from '@mantine/core'

interface Props {
  opened: boolean
  targetName: string
  onClose: () => void
  onConfirm: () => void
}

/** 削除確認ダイアログ（デモのため実際の削除処理は行わない） */
export function ConfirmDelete({ opened, targetName, onClose, onConfirm }: Props) {
  return (
    <Modal opened={opened} onClose={onClose} title="削除の確認" centered>
      <Text size="sm">「{targetName}」を削除しますか？</Text>
      <Text size="xs" c="dimmed" mt="xs">
        ※デモのため実際には削除されません
      </Text>
      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={onClose}>
          キャンセル
        </Button>
        <Button color="red" onClick={onConfirm}>
          削除
        </Button>
      </Group>
    </Modal>
  )
}
