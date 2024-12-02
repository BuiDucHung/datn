import { Button, ButtonProps } from 'antd';
import { PropsWithChildren, useEffect, useState } from 'react';
import './style.scss';
import { COLOR } from 'src/utils/color';

const LARGE_TEXT = 'large';
const SMALL_TEXT = 'small';
const MEDIUM_TEXT = 'medium';

export type KSButtonProps = ButtonProps & {
  width?: string;
  height?: string;
  borderRadius?: string;
  cancelStyle: boolean;
  sizeText?: 'large' | 'small' | 'medium';
  textColor?: string;
  backgroundColor?: string;
  linerButton?: boolean;
};

const defaultProps: KSButtonProps = {
  width: '200px',
  height: '49px',
  borderRadius: '12px',
  textColor: COLOR.ksBlackColorDefault,
  cancelStyle: false,
  linerButton: true,
  sizeText: LARGE_TEXT
};

function KSButton(props: PropsWithChildren<KSButtonProps>) {
  const {
    width,
    height,
    textColor,
    backgroundColor,
    linerButton,
    sizeText,
    borderRadius,
    cancelStyle,
    style,
    children,
    className,
    ...remain
  } = props;
  const [customClass, setCustomClass] = useState<string>('');
  useEffect(() => {
    let classStyle = '';
    if (!backgroundColor) {
      if (cancelStyle) {
        classStyle += 'ks-button-cancel ';
      } else {
        if (linerButton) {
          classStyle += 'ks-button-ok ';
        }
      }
    }
    if (sizeText === LARGE_TEXT) {
      classStyle += 'ks-text-large ';
    } else if (sizeText === MEDIUM_TEXT) {
      classStyle += 'ks-text-medium ';
    } else if (sizeText === SMALL_TEXT) {
      classStyle += 'ks-text-small ';
    }
    return setCustomClass(classStyle);
  }, [backgroundColor, cancelStyle, linerButton, sizeText]);

  return (
    <Button
      {...remain}
      style={{
        width: width,
        height: height,
        borderRadius: borderRadius,
        color: backgroundColor || cancelStyle ? textColor : '',
        backgroundColor: backgroundColor,
        ...style
      }}
      className={'ks-button ' + customClass + className}
    >
      {children}
    </Button>
  );
}

KSButton.defaultProps = defaultProps;

export default KSButton;
