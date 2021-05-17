import { ButtonProps as ButtonPropsMUI, Modal as ModalMUI } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import CancelIcon from '@material-ui/icons/Cancel'
import React, { ReactElement, ReactNode, ReactNodeArray } from 'react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        ModalStyled: {
            alignItems: 'center',
            flexDirection: 'column',
            display: 'flex',
            overflowY: 'scroll',
            '& .overlay': {
                backgroundColor: 'rgba(10, 10, 10, 0.75) !important'
            },
        },
        Paper: {
            position: 'relative',
            top: '50%',
            width: '500px',
            transform: 'translate(0, -50%)',
            borderRadius: '8px',
            boxShadow: '1px 2px 10px 0 rgba(40, 54, 61, 0.18)',
            display: 'flex',
            flexDirection: 'column',
            '&:focus': {
              outline: 'none',
            },
            '& .bigger-modal-window': {
              width: '775px',
              height: 'auto',
            },
            '& .smaller-modal-window': {
              height: 'auto',
              maxHeight: '90vh',
              overflow: 'hidden',
              overflowY: 'auto',
            },
            '& .modal': {
              height: 'auto',
              maxWidth: 'calc(100% - 130px)',
            }
        },
        modalHeader: {
            display: 'flex',
            padding: '24px 18px 24px 24px',
            borderBottom: '2px solid #efefef',
            '& h5': {
              color: '#000'
            },
            '& $closeButton': {
              alignSelf: 'flex-end',
              background: 'none',
              border: 'none',
              padding: '5px',
              width: '26px',
              height: '26px',
              '& span': {
                marginRight: 0
              },          
              '&:hover': {
                background: '#efefef',
                borderRadius: '16px',
                cursor: 'pointer'
              }
            }
        },
        TitleStyled: {
            display: 'flex',
            alignItems: 'center',
            flexBasis: '100%',
            '.image, img': {
              width: '20px',
              marginRight: '10px',
            },          
            '.note, span': {
              marginLeft: '12px',
            }
        },
        BodySection: {
            padding: 0
        },
        ButtonStyled: {
            '&.MuiButtonBase-root': {
                margin: '0 10px'
            }
        },
        FooterSection: {
            display: 'flex',
            justifyContent: 'center',
            borderTop: '2px solid #efefef',
            padding: '24px',
        },
    })
)

interface HoldModalProps {
  children: ReactNode
  description: string
  // type copied from Material-UI Modal's `close` prop
  handleClose?: (event: Record<string, unknown>, reason: 'backdropClick' | 'escapeKeyDown') => void
  open: boolean
  paperClassName?: string
  title: string
}

const HoldModal = ({ children, description, handleClose, open, paperClassName, title }: HoldModalProps): ReactElement => {
    const classes = useStyles()

    return (
        <ModalMUI className={classes.ModalStyled}
            BackdropProps={{ className: 'overlay' }}
            aria-describedby={description}
            aria-labelledby={title}
            onClose={handleClose}
            open={open}
        >
            <div className={`${classes.Paper} ${paperClassName}`}>{children}</div>
        </ModalMUI>
    )
}

export default HoldModal

/*****************/
/* Generic Modal */
/*****************/

interface TitleProps {
  children: string | ReactNode
  size?: number
  withoutMargin?: boolean
  strong?: boolean
}

const Title = ({ children, ...props }: TitleProps): ReactElement => {
    const classes = useStyles()

    return (
        <div className={classes.TitleStyled} withoutMargin {...props}>
            {children}
        </div>
    )
}

interface HeaderProps {
  children?: ReactNode
  onClose?: (event: any) => void
}

const Header = ({ children, onClose }: HeaderProps): ReactElement => {
    const classes = useStyles()

    return (
    <div className={classes.modalHeader}>
      {children}

      {onClose && (
        <button className="closeButton" onClick={onClose}>
          <CancelIcon />
        </button>
      )}
    </div>
  )
}

Header.Title = Title

/*** Body ***/
interface BodyProps {
  children: ReactNode | ReactNodeArray
  withoutPadding?: boolean
}

const Body = ({ children, withoutPadding = false }: BodyProps): ReactElement => {
    const classes = useStyles()

    return (
        <div className={classes.BodySection}>
            {children}
        </div>
    )
}

/*** Footer ***/
type CustomButtonMUIProps = Omit<ButtonPropsMUI, 'size' | 'color' | 'variant'> & {
  to?: string
  component?: ReactNode
}

interface ButtonProps extends CustomButtonMUIProps {
  text?: string
  size?: number
  color?: 'primary' | 'secondary' | 'error'
  variant?: 'bordered' | 'contained' | 'outlined'
}

interface ButtonsProps {
  cancelButtonProps?: ButtonProps
  confirmButtonProps?: ButtonProps
}

const Buttons = ({ cancelButtonProps = {}, confirmButtonProps = {} }: ButtonsProps): ReactElement => {
    const classes = useStyles()
    const { text: cancelText = 'Cancel' } = cancelButtonProps
    const { text: confirmText = 'Submit' } = confirmButtonProps

    return (
        <>
            <Button
                className={classes.ButtonStyled}
                type={cancelButtonProps?.onClick ? 'button' : 'submit'}
            >
                {cancelText}
            </Button>
            <Button
                className={classes.ButtonStyled}
                type={confirmButtonProps?.onClick ? 'button' : 'submit'}
            >
                {confirmText}
            </Button>
        </>
    )
}

interface FooterProps {
  children: ReactNode | ReactNodeArray
}

const Footer = ({ children }: FooterProps): ReactElement => {
    const classes = useStyles()
    return (
        <div className={classes.FooterSection}>{children}</div>
    )
}

Footer.Buttons = Buttons

interface ModalProps {
  children: ReactNode
  description: string
  handleClose: () => void
  open: boolean
  title: string
}

export const Modal = ({ children, ...props }: ModalProps): ReactElement => {
    return (
        <HoldModal {...props} paperClassName="modal">
            {children}
        </HoldModal>
    )
}

Modal.Header = Header
Modal.Body = Body
Modal.Footer = Footer
