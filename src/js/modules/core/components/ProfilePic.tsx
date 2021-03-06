import * as React from "react";
import injectSheet, { WithStyles } from "react-jss";
import HoverOverlay from "./HoverOverlay";
import { delay } from "../../utils";
import { bindActionCreators, Dispatch } from "redux";
import { uploadProfilePic } from "../coreActions";
import { connect } from "react-redux";

interface Props extends WithStyles<typeof styles> {
  uid: string;
  photoURL: string;
  uploadProfilePic: (file: File, uid: string) => any;
}

interface State {
  isHovering: boolean;
  isClicked: boolean;
}

const styles = {
  fileInput: {
    display: "none"
  },
  ProfilePic: {
    paddingBottom: "220px",
    position: "relative"
  },
  roundImg: {
    borderRadius: "50%",
    width: "200px",
    height: "200px",
    marginBottom: "20px",
    position: "absolute",
    top: "0",
    right: "-105px",
    transition: "filter 0.3s",
    objectFit: "cover"
  }
};

class ProfilePic extends React.Component<Props, State> {
  private fileUploader = React.createRef<HTMLInputElement>();

  constructor(props: Props) {
    super(props);
    this.state = {
      isHovering: false,
      isClicked: false
    };
  }

  handleClick = () => {
    // Gotta love how I have to do this by hand. Basically
    // gives a short little "click" via local state and
    // a simple style prop.
    this.setState({ isClicked: true }, () => {
      delay(75).then(() => this.setState({ isClicked: false }));
    });
    this.fileUploader.current.click();
  };

  handleUpload = () => {
    const { uid, uploadProfilePic } = this.props;
    const file = this.fileUploader.current.files[0];
    uploadProfilePic(file, uid);
  };

  handleMouseEnter = () => {
    this.setState({ isHovering: true });
  };

  handleMouseLeave = () => {
    this.setState({ isHovering: false });
  };

  render() {
    let { classes, photoURL } = this.props;
    const { isHovering, isClicked } = this.state;

    return (
      <div
        className={classes.ProfilePic}
        style={{ filter: isClicked ? "brightness(75%)" : "none" }}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <img
          onClick={this.handleClick}
          src={photoURL}
          // Yeah yeah yeah inline styles. But I wasn't about to make a new
          // component for this shit
          style={{ filter: isHovering ? "brightness(75%)" : "none" }}
          className={classes.roundImg}
        />
        <input
          className={classes.fileInput}
          onChange={this.handleUpload}
          type="file"
          ref={this.fileUploader}
        />
        <HoverOverlay isHovering={isHovering} onClick={this.handleClick} />
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators({ uploadProfilePic }, dispatch);

export default injectSheet(styles)(
  connect(
    undefined,
    mapDispatchToProps
  )(ProfilePic)
);
