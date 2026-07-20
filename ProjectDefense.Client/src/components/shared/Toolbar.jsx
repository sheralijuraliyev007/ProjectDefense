import { Button, Tooltip } from '@heroui/react';

export default function Toolbar({ actions, selectedCount = 0 }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-default-50 rounded-lg mb-4">
      {selectedCount > 0 && (
        <span className="text-sm text-default-600 mr-2">
          {selectedCount} selected
        </span>
      )}
      {actions.map((action, index) => {
        const isDisabled = action.requiresSelection && selectedCount === 0;
        
        return (
          <Tooltip key={index} content={action.label}>
            <Button
              size="sm"
              color={action.color || 'default'}
              variant={action.variant || 'flat'}
              isDisabled={isDisabled}
              onPress={action.onClick}
              startContent={action.icon}
              isIconOnly={!!action.icon && !action.label}
            >
              {action.label}
            </Button>
          </Tooltip>
        );
      })}
    </div>
  );
}