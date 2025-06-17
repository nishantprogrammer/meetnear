type AccessibilityState = {
  disabled?: boolean;
  selected?: boolean;
  checked?: boolean;
  expanded?: boolean;
};

type AccessibilityProps = {
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
  accessibilityState?: AccessibilityState;
};

export const createAccessibilityProps = (
  label: string,
  hint?: string,
  role?: string,
  state?: AccessibilityState
): AccessibilityProps => ({
  accessible: true,
  accessibilityLabel: label,
  accessibilityHint: hint,
  accessibilityRole: role,
  accessibilityState: state,
});

export const createButtonAccessibilityProps = (label: string, hint?: string, disabled?: boolean) =>
  createAccessibilityProps(label, hint, 'button', { disabled });

export const createImageAccessibilityProps = (label: string, hint?: string) =>
  createAccessibilityProps(label, hint, 'image');

export const createTextAccessibilityProps = (label: string, hint?: string) =>
  createAccessibilityProps(label, hint, 'text');

export const createHeaderAccessibilityProps = (
  label: string,
  hint?: string,
  level: 1 | 2 | 3 | 4 | 5 | 6 = 1
) => createAccessibilityProps(label, hint, `header${level}`);

export const createLinkAccessibilityProps = (label: string, hint?: string) =>
  createAccessibilityProps(label, hint, 'link');

export const createCheckboxAccessibilityProps = (label: string, hint?: string, checked?: boolean) =>
  createAccessibilityProps(label, hint, 'checkbox', { checked });

export const createRadioAccessibilityProps = (label: string, hint?: string, selected?: boolean) =>
  createAccessibilityProps(label, hint, 'radio', { selected });

export const createSwitchAccessibilityProps = (label: string, hint?: string, checked?: boolean) =>
  createAccessibilityProps(label, hint, 'switch', { checked });

export const createTabAccessibilityProps = (label: string, hint?: string, selected?: boolean) =>
  createAccessibilityProps(label, hint, 'tab', { selected });

export const createSliderAccessibilityProps = (label: string, hint?: string, disabled?: boolean) =>
  createAccessibilityProps(label, hint, 'slider', { disabled });

export const createSearchAccessibilityProps = (label: string, hint?: string) =>
  createAccessibilityProps(label, hint, 'search');

export const createSpinButtonAccessibilityProps = (
  label: string,
  hint?: string,
  disabled?: boolean
) => createAccessibilityProps(label, hint, 'spinbutton', { disabled });

export const createProgressBarAccessibilityProps = (label: string, hint?: string) =>
  createAccessibilityProps(label, hint, 'progressbar');

export const createScrollViewAccessibilityProps = (label: string, hint?: string) =>
  createAccessibilityProps(label, hint, 'scrollview');

export const createListAccessibilityProps = (label: string, hint?: string) =>
  createAccessibilityProps(label, hint, 'list');

export const createListItemAccessibilityProps = (
  label: string,
  hint?: string,
  selected?: boolean
) => createAccessibilityProps(label, hint, 'listitem', { selected });

export const createMenuAccessibilityProps = (label: string, hint?: string) =>
  createAccessibilityProps(label, hint, 'menu');

export const createMenuItemAccessibilityProps = (
  label: string,
  hint?: string,
  disabled?: boolean
) => createAccessibilityProps(label, hint, 'menuitem', { disabled });

export const createToolbarAccessibilityProps = (label: string, hint?: string) =>
  createAccessibilityProps(label, hint, 'toolbar');

export const createTooltipAccessibilityProps = (label: string, hint?: string) =>
  createAccessibilityProps(label, hint, 'tooltip');

export const createDialogAccessibilityProps = (label: string, hint?: string) =>
  createAccessibilityProps(label, hint, 'dialog');

export const createAlertAccessibilityProps = (label: string, hint?: string) =>
  createAccessibilityProps(label, hint, 'alert');

export const createStatusAccessibilityProps = (label: string, hint?: string) =>
  createAccessibilityProps(label, hint, 'status');

export const createTimerAccessibilityProps = (label: string, hint?: string) =>
  createAccessibilityProps(label, hint, 'timer');

export const createLogAccessibilityProps = (label: string, hint?: string) =>
  createAccessibilityProps(label, hint, 'log');

export const createMarqueeAccessibilityProps = (label: string, hint?: string) =>
  createAccessibilityProps(label, hint, 'marquee');

export const createTabListAccessibilityProps = (label: string, hint?: string) =>
  createAccessibilityProps(label, hint, 'tablist');

export const createTabPanelAccessibilityProps = (label: string, hint?: string) =>
  createAccessibilityProps(label, hint, 'tabpanel');

export const createTreeAccessibilityProps = (label: string, hint?: string) =>
  createAccessibilityProps(label, hint, 'tree');

export const createTreeItemAccessibilityProps = (
  label: string,
  hint?: string,
  expanded?: boolean
) => createAccessibilityProps(label, hint, 'treeitem', { expanded });
