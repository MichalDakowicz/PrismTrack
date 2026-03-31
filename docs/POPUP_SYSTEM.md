# Popup Notification System

A global toast notification system that displays info popups from anywhere in the application with auto-dismiss capability.

## Setup

The `PopupProvider` and `PopupRenderer` are already integrated into `Root.tsx`. No additional setup is needed.

## Usage

### Using the `usePopups()` Hook (Recommended)

The easiest way to show notifications with type-safe shortcuts:

```tsx
import { usePopups } from "../hooks/usePopups";

function MyComponent() {
  const popups = usePopups();

  return (
    <>
      <button onClick={() => popups.info("Title", "This is an info message")}>
        Info
      </button>
      
      <button onClick={() => popups.success("Done!", "Operation completed")}>
        Success
      </button>
      
      <button onClick={() => popups.error("Error", "Something failed")}>
        Error
      </button>
      
      <button onClick={() => popups.warning("Warning", "Be careful!")}>
        Warning
      </button>
    </>
  );
}
```

### Using Direct `usePopup()` Hook

For more control, use the underlying context hook:

```tsx
import { usePopup } from "../contexts/PopupContext";

function MyComponent() {
  const { showPopup, closePopup } = usePopup();

  const handleClick = () => {
    const id = showPopup({
      type: "info",
      title: "Custom Notification",
      message: "This is a custom notification",
      autoClose: true,
      duration: 2000,
    });
    
    // Close it manually later if needed
    // closePopup(id);
  };

  return <button onClick={handleClick}>Show Notification</button>;
}
```

## Popup Types

- **info**: Blue icon, informational message (auto-closes after 3s)
- **success**: Green checkmark, success confirmation (auto-closes after 3s)
- **warning**: Yellow alert icon, warning message (auto-closes after 4s)
- **error**: Red alert icon, error message (auto-closes after 5s)
- **confirm**: Gray icon, general notification (does not auto-close by default)

## API Reference

### `usePopups()` Hook

**Methods:**

- `info(title, message, duration?)` - Show info popup (auto-closes)
- `success(title, message, duration?)` - Show success popup (auto-closes)
- `warning(title, message, duration?)` - Show warning popup (auto-closes)
- `error(title, message, duration?)` - Show error popup (auto-closes)
- `custom(config)` - Show custom popup with full configuration
- `close(id)` - Close popup by ID
- `update(id, config)` - Update popup properties

### `usePopup()` Hook

**Methods:**

- `showPopup(config)` - Returns popup ID
  - `type`: "info" | "success" | "warning" | "error" | "confirm"
  - `title`: string
  - `message`: string
  - `autoClose?`: boolean (default: false, set to true for auto-dismiss)
  - `duration?`: number (milliseconds, default: 3000)

- `closePopup(id)` - Close by ID
- `updatePopup(id, config)` - Update by ID

## Examples

### Success Notification After Action

```tsx
const popups = usePopups();

const handleSave = async () => {
  try {
    await api.saveData(data);
    popups.success("Saved!", "Your changes have been saved");
  } catch (error) {
    popups.error("Error", "Failed to save changes");
  }
};
```

### Auto-closing Notifications

```tsx
const popups = usePopups();

// Auto-closes after 2 seconds
popups.success("Saved!", "Your changes have been saved", 2000);

// Auto-closes after default duration (3000ms for info/success)
popups.info("Tip", "Use Ctrl+K for the command palette");
```

### Custom Configuration

```tsx
const { showPopup } = usePopup();

showPopup({
  type: "warning",
  title: "Important",  
  message: "This is a very important message",
  autoClose: true,
  duration: 6000,  // Stay visible for 6 seconds
});
```

## Styling

Notifications use the app's color scheme:
- Colors are determined by notification type
- Uses Tailwind CSS classes that adapt to light/dark mode
- Border colors change based on notification type
- Icons are color-coded per type
- Notifications appear in the bottom-right corner
- Stack vertically when multiple are shown

## Features

- ✅ Global state management (no prop drilling)
- ✅ Auto-closing notifications with configurable duration
- ✅ Multiple notifications shown simultaneously
- ✅ Type-safe hooks
- ✅ Icon indicators for notification type
- ✅ Smooth animations
- ✅ Dark mode support
- ✅ Bottom-right toast positioning
- ✅ Dismissible by clicking X button
