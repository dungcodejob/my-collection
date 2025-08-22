import {
  animate,
  AnimationTriggerMetadata,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";

// Animation duration constants
export const ANIMATION_DURATION = {
  FAST: "150ms",
  NORMAL: "200ms",
  SLOW: "300ms",
} as const;

// Animation easing constants
export const ANIMATION_EASING = {
  EASE_IN_OUT: "ease-in-out",
  EASE_IN: "ease-in",
  EASE_OUT: "ease-out",
  LINEAR: "linear",
} as const;

export const expandCollapseAnimationOptions = {
  name: "expandCollapse",
  duration: ANIMATION_DURATION.NORMAL,
  easing: ANIMATION_EASING.EASE_IN_OUT,
};

export const expandCollapseState = {
  collapsed: "collapsed",
  expanded: "expanded",
} as const;

export function createExpandCollapseAnimation(
  options: {
    name: string;
    duration?: string;
    easing?: string;
  } = expandCollapseAnimationOptions
): AnimationTriggerMetadata {
  const mergeOptions = {
    ...expandCollapseAnimationOptions,
    ...options,
  };

  return trigger(mergeOptions.name, [
    state(
      expandCollapseState.collapsed,
      style({
        height: "0px",
        opacity: 0,
        overflow: "hidden",
      })
    ),
    state(
      expandCollapseState.expanded,
      style({
        height: "*",
        opacity: 1,
        overflow: "visible",
      })
    ),
    transition(`${expandCollapseState.collapsed} <=> ${expandCollapseState.expanded}`, [
      animate(`${mergeOptions.duration} ${mergeOptions.easing}`),
    ]),
  ]);
}

export const chevronRotateAnimationOptions = {
  name: "chevronRotate",
  duration: ANIMATION_DURATION.NORMAL,
  easing: ANIMATION_EASING.EASE_IN_OUT,
};

export function createChevronRotateAnimation(
  options: {
    name: string;
    duration?: string;
    easing?: string;
  } = {
    name: "chevronRotate",
    duration: ANIMATION_DURATION.NORMAL,
    easing: ANIMATION_EASING.EASE_IN_OUT,
  }
): AnimationTriggerMetadata {
  const mergeOptions = {
    ...chevronRotateAnimationOptions,
    ...options,
  };

  return trigger(options.name, [
    state(
      expandCollapseState.collapsed,
      style({
        transform: "rotate(0deg)",
      })
    ),
    state(
      expandCollapseState.expanded,
      style({
        transform: "rotate(90deg)",
      })
    ),
    transition(`${expandCollapseState.collapsed} <=> ${expandCollapseState.expanded}`, [
      animate(`${mergeOptions.duration} ${mergeOptions.easing}`),
    ]),
  ]);
}
