import React from 'react';
import { TextInput, Button, Group, ActionIcon } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';

interface KeyValueItem {
  key: string;
  value: string;
}

interface KeyValueEditorProps {
  items: KeyValueItem[];
  onChange: (items: KeyValueItem[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

// Komentar: Komponen untuk mengedit key-value pairs (misalnya untuk headers dan parameters)
export function KeyValueEditor({
  items,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value'
}: KeyValueEditorProps) {

  // Komentar: Handler untuk perubahan key
  const handleKeyChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index].key = value;
    onChange(newItems);
  };

  // Komentar: Handler untuk perubahan value
  const handleValueChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index].value = value;
    onChange(newItems);
  };

  // Komentar: Tambah item baru
  const addItem = () => {
    onChange([...items, { key: '', value: '' }]);
  };

  // Komentar: Hapus item
  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    // Komentar: Pastikan minimal ada satu item kosong
    if (newItems.length === 0) {
      newItems.push({ key: '', value: '' });
    }
    onChange(newItems);
  };

  return (
    <>
      {items.map((item, index) => (
        <Group key={index} mt="xs" gap="xs" wrap="nowrap">
          <TextInput
            placeholder={keyPlaceholder}
            value={item.key}
            onChange={(e) => handleKeyChange(index, e.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <TextInput
            placeholder={valuePlaceholder}
            value={item.value}
            onChange={(e) => handleValueChange(index, e.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <ActionIcon
            color="red"
            variant="subtle"
            onClick={() => removeItem(index)}
            disabled={items.length === 1 && !item.key && !item.value}
            title="Remove"
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ))}
      <Group justify="flex-end" mt="md">
        <Button
          leftSection={<IconPlus size={16} />}
          variant="light"
          size="xs"
          onClick={addItem}
        >
          Add
        </Button>
      </Group>
    </>
  );
}
