/* eslint-disable @typescript-eslint/ban-types */
import React, { useCallback } from 'react';
import deviceInfo from '/imports/utils/deviceInfo';
import { defineMessages, useIntl } from 'react-intl';
import { useShortcut } from '/imports/ui/core/hooks/useShortcut';
import BBBMenu from '/imports/ui/components/common/menu/component';
import { MenuSeparatorItemType, MenuOptionItemType } from '/imports/ui/components/common/menu/menuTypes';
import Styled from '../styles';
import {
  handleLeaveAudio,
  liveChangeInputDevice,
  liveChangeOutputDevice,
  notify,
  truncateDeviceName,
} from '../service';
import Mutetoggle from './muteToggle';
import ListenOnly from './listenOnly';

const AUDIO_INPUT = 'audioinput';
const AUDIO_OUTPUT = 'audiooutput';
const SET_SINK_ID_SUPPORTED = 'setSinkId' in HTMLMediaElement.prototype;

const intlMessages = defineMessages({
  defaultOutputDeviceLabel: {
    id: 'app.audio.audioSettings.defaultOutputDeviceLabel',
    description: 'Default output device label',
  },
  loading: {
    id: 'app.audio.loading',
    description: 'Loading audio dropdown item label',
  },
  noDeviceFound: {
    id: 'app.audio.noDeviceFound',
    description: 'No device found',
  },
  microphones: {
    id: 'app.audio.microphones',
    description: 'Input audio dropdown item label',
  },
  speakers: {
    id: 'app.audio.speakers',
    description: 'Output audio dropdown item label',
  },
  leaveAudio: {
    id: 'app.audio.leaveAudio',
    description: 'Leave audio dropdown item label',
  },
  changeAudioDevice: {
    id: 'app.audio.changeAudioDevice',
    description: 'Change audio device button label',
  },
  deviceChangeFailed: {
    id: 'app.audioNotification.deviceChangeFailed',
    description: 'Device change failed',
  },
});

interface MuteToggleProps {
  talking: boolean;
  muted: boolean;
  disabled: boolean;
  isAudioLocked: boolean;
  toggleMuteMicrophone: (muted: boolean) => void;
}

interface LiveSelectionProps extends MuteToggleProps {
  listenOnly: boolean;
  inputDevices: MediaDeviceInfo[];
  outputDevices: MediaDeviceInfo[];
  inputDeviceId: string;
  outputDeviceId: string;
  meetingIsBreakout: boolean;
}

export const LiveSelection: React.FC<LiveSelectionProps> = ({
  listenOnly,
  inputDevices,
  outputDevices,
  inputDeviceId,
  outputDeviceId,
  meetingIsBreakout,
  talking,
  muted,
  disabled,
  isAudioLocked,
  toggleMuteMicrophone,
}) => {
  const intl = useIntl();

  const leaveAudioShourtcut = useShortcut('leaveAudio');

  const renderDeviceList = useCallback((
    deviceKind: string,
    list: MediaDeviceInfo[],
    callback: Function,
    title: string,
    currentDeviceId: string,
  ) => {
    const listLength = list ? list.length : -1;
    const listTitle = [
      {
        key: `audioDeviceList-${deviceKind}`,
        label: title,
        iconRight: (deviceKind === 'audioinput') ? 'unmute' : 'volume_level_2',
        disabled: true,
        customStyles: Styled.DisabledLabel,
      } as MenuOptionItemType,
      {
        key: 'separator-01',
        isSeparator: true,
      } as MenuSeparatorItemType,
    ];

    let deviceList: MenuOptionItemType[] = [];

    if (listLength > 0) {
      deviceList = list.map((device, index) => (
        {
          key: `${device.deviceId}-${deviceKind}`,
          dataTest: `${deviceKind}-${index + 1}`,
          label: truncateDeviceName(device.label),
          customStyles: (device.deviceId === currentDeviceId) ? Styled.SelectedLabel : null,
          iconRight: (device.deviceId === currentDeviceId) ? 'check' : null,
          onClick: () => onDeviceListClick(device.deviceId, deviceKind, callback),
        } as MenuOptionItemType
      ));
    } else if (deviceKind === AUDIO_OUTPUT && !SET_SINK_ID_SUPPORTED && listLength === 0) {
      // If the browser doesn't support setSinkId, show the chosen output device
      // as a placeholder Default - like it's done in audio/device-selector
      deviceList = [
        {
          key: `defaultDeviceKey-${deviceKind}`,
          label: intl.formatMessage(intlMessages.defaultOutputDeviceLabel),
          customStyles: Styled.SelectedLabel,
          iconRight: 'check',
          disabled: true,
        } as MenuOptionItemType,
      ];
    } else {
      deviceList = [
        {
          key: `noDeviceFoundKey-${deviceKind}-`,
          label: listLength < 0
            ? intl.formatMessage(intlMessages.loading)
            : intl.formatMessage(intlMessages.noDeviceFound),
        } as MenuOptionItemType,
      ];
    }

    return listTitle.concat(deviceList);
  }, []);

  const onDeviceListClick = useCallback((deviceId: string, deviceKind: string, callback: Function) => {
    if (!deviceId) return;
    if (deviceKind === AUDIO_INPUT) {
      callback(deviceId).catch(() => {
        notify(intl.formatMessage(intlMessages.deviceChangeFailed), true);
      });
    } else {
      callback(deviceId, true).catch(() => {
        notify(intl.formatMessage(intlMessages.deviceChangeFailed), true);
      });
    }
  }, []);

  const inputDeviceList = !listenOnly
    ? renderDeviceList(
      AUDIO_INPUT,
      inputDevices,
      liveChangeInputDevice,
      intl.formatMessage(intlMessages.microphones),
      inputDeviceId,
    ) : [];

  const outputDeviceList = renderDeviceList(
    AUDIO_OUTPUT,
    outputDevices,
    liveChangeOutputDevice,
    intl.formatMessage(intlMessages.speakers),
    outputDeviceId,
  );

  const leaveAudioOption = {
    icon: 'logout',
    label: intl.formatMessage(intlMessages.leaveAudio),
    key: 'leaveAudioOption',
    dataTest: 'leaveAudio',
    customStyles: Styled.DangerColor,
    onClick: () => handleLeaveAudio(meetingIsBreakout),
  };
  const dropdownListComplete = inputDeviceList.concat(outputDeviceList)
    .concat({
      key: 'separator-02',
      isSeparator: true,
    })
    .concat(leaveAudioOption);
  const customStyles = { top: '-1rem' };
  const { isMobile } = deviceInfo;
  return (
    <>
      {!listenOnly ? (
        // eslint-disable-next-line jsx-a11y/no-access-key
        <span
          style={{ display: 'none' }}
          accessKey={leaveAudioShourtcut}
          onClick={() => handleLeaveAudio(meetingIsBreakout)}
          aria-hidden="true"
        />
      ) : null}
      <BBBMenu
        customStyles={!isMobile ? customStyles : null}
        trigger={(
          <>
            {listenOnly
              ? (
                <ListenOnly
                  listenOnly={listenOnly}
                  handleLeaveAudio={handleLeaveAudio}
                  meetingIsBreakout={meetingIsBreakout}
                />
              )
              : (
                <Mutetoggle
                  talking={talking}
                  muted={muted}
                  disabled={disabled || isAudioLocked}
                  isAudioLocked={isAudioLocked}
                  toggleMuteMicrophone={toggleMuteMicrophone}
                />
              )}
            <Styled.AudioDropdown
              data-test="audioDropdownMenu"
              emoji="device_list_selector"
              label={intl.formatMessage(intlMessages.changeAudioDevice)}
              hideLabel
              tabIndex={0}
              rotate
            />
          </>
        )}
        actions={!isAudioLocked ? dropdownListComplete : [leaveAudioOption]}
        opts={{
          id: 'audio-selector-dropdown-menu',
          keepMounted: true,
          transitionDuration: 0,
          elevation: 3,
          getcontentanchorel: null,
          fullwidth: 'true',
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
          transformOrigin: { vertical: 'bottom', horizontal: 'center' },
        }}
      />
    </>
  );
};

export default LiveSelection;
