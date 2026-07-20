import { useState } from 'react';
import { Tabs, Tab } from '@heroui/react';

export default function MarkdownEditor({ value, onChange, placeholder }) {
  const [activeTab, setActiveTab] = useState('write');

  const renderMarkdown = (text) => {
    // Simple markdown rendering - you can use a library like react-markdown
    return text
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      .replace(/\n/gim, '<br>');
  };

  return (
    <div className="border border-default-200 rounded-lg overflow-hidden">
      <Tabs selectedKey={activeTab} onSelectionChange={setActiveTab} size="sm">
        <Tab key="write" title="Write" />
        <Tab key="preview" title="Preview" />
      </Tabs>
      {activeTab === 'write' ? (
        <textarea
          className="w-full p-3 min-h-[150px] bg-background resize-y outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <div
          className="w-full p-3 min-h-[150px] markdown-content bg-default-50"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(value || '') }}
        />
      )}
    </div>
  );
}