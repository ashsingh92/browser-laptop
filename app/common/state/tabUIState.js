/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

// Constants
const settings = require('../../../js/constants/settings')

// State helpers
const partitionState = require('../../common/state/tabContentState/partitionState')
const privateState = require('../../common/state/tabContentState/privateState')
const closeState = require('../../common/state/tabContentState/closeState')
const frameStateUtil = require('../../../js/state/frameStateUtil')

// Utils
const {isEntryIntersected} = require('../../../app/renderer/lib/observerUtil')
const {getTextColorForBackground} = require('../../../js/lib/color')

// Settings
const {getSetting} = require('../../../js/settings')

// Styles
const {intersection} = require('../../renderer/components/styles/global')
const {theme} = require('../../renderer/components/styles/theme')

module.exports.getThemeColor = (state, frameKey) => {
  const frame = frameStateUtil.getFrameByKey(state, frameKey)

  if (frame == null) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Unable to find frame for getThemeColor method')
    }
    return false
  }

  return (
    getSetting(settings.PAINT_TABS) &&
    (frame.get('themeColor') || frame.get('computedThemeColor'))
  )
}

module.exports.getTabIconColor = (state, frameKey) => {
  const frame = frameStateUtil.getFrameByKey(state, frameKey)

  if (frame == null) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Unable to find frame for getTabIconColor method')
    }
    return ''
  }

  const isPrivate = frame.get('isPrivate')
  const isActive = frameStateUtil.isFrameKeyActive(state, frameKey)
  const hoverState = frameStateUtil.getTabHoverState(state, frameKey)
  const themeColor = frame.get('themeColor') || frame.get('computedThemeColor')
  const activeNonPrivateTab = !isPrivate && isActive
  const isPrivateTab = isPrivate && (isActive || hoverState)
  const defaultColor = isPrivateTab ? 'white' : 'black'
  const isPaintTabs = getSetting(settings.PAINT_TABS)

  return activeNonPrivateTab && isPaintTabs && !!themeColor
    ? getTextColorForBackground(themeColor)
    : defaultColor
}

module.exports.checkIfTextColor = (state, frameKey, color) => {
  const frame = frameStateUtil.getFrameByKey(state, frameKey)

  if (frame == null) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Unable to find frame for checkIfTextColor method')
    }
    return false
  }

  return module.exports.getTabIconColor(state, frameKey) === color
}

module.exports.showTabEndIcon = (state, frameKey) => {
  const frame = frameStateUtil.getFrameByKey(state, frameKey)

  if (frame == null) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Unable to find frame for showTabEndIcon method')
    }
    return false
  }

  return (
    !closeState.hasFixedCloseIcon(state, frameKey) &&
    !closeState.hasRelativeCloseIcon(state, frameKey) &&
    !isEntryIntersected(state, 'tabs', intersection.at40)
  )
}

module.exports.addExtraGutterToTitle = (state, frameKey) => {
  const frame = frameStateUtil.getFrameByKey(state, frameKey)

  if (frame == null) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Unable to find frame for addExtraGutterToTitle method')
    }
    return false
  }

  return frameStateUtil.frameLocationMatch(frame, 'about:newtab')
}

module.exports.centralizeTabIcons = (state, frameKey, isPinned) => {
  const frame = frameStateUtil.getFrameByKey(state, frameKey)

  if (frame == null) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Unable to find frame for centralizeTabIcons method')
    }
    return false
  }

  return isPinned || isEntryIntersected(state, 'tabs', intersection.at40)
}

module.exports.getTabEndIconBackgroundColor = (state, frameKey) => {
  const frame = frameStateUtil.getFrameByKey(state, frameKey)

  if (frame == null) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Unable to find frame for getTabEndIconBackgroundColor method')
    }
    return false
  }

  const themeColor = module.exports.getThemeColor(state, frameKey)
  const isPrivate = privateState.isPrivateTab(state, frameKey)
  const isPartition = partitionState.isPartitionTab(state, frameKey)
  const isHover = frameStateUtil.getTabHoverState(state, frameKey)
  const isActive = frameStateUtil.isFrameKeyActive(state, frameKey)
  const hasCloseIcon = closeState.showCloseTabIcon(state, frameKey)
  const isIntersecting = isEntryIntersected(state, 'tabs', intersection.at40)

  let backgroundColor = theme.tab.background

  if (isActive && themeColor) {
    backgroundColor = themeColor
  }
  if (isActive && !themeColor) {
    backgroundColor = theme.tab.active.background
  }
  if (isIntersecting) {
    backgroundColor = 'transparent'
  }
  if (!isActive && isPrivate) {
    backgroundColor = theme.tab.private.background
  }
  if ((isActive || isHover) && isPrivate) {
    backgroundColor = theme.tab.active.private.background
  }

  return isPartition || isPrivate || hasCloseIcon
    ? `linear-gradient(to left, ${backgroundColor} 10px, transparent 40px)`
    : `linear-gradient(to left, ${backgroundColor} 0, transparent 12px)`
}
