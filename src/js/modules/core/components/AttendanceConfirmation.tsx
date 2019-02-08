import * as React from "react";
import injectSheet, { WithStyles } from "react-jss";
import Underline from "./Underline";
import { ConfirmationFormData } from "../../types";
import { User } from "firebase";
import { compose } from "redux";
import { connect } from "react-redux";
import { Theme } from "../../ThemeInjector";
import { ReduxState } from "../../../reducers";

interface Props extends WithStyles<typeof styles> {
  user: User;
  confirmFormData: ConfirmationFormData
}

const styles = (theme: Theme) => ({
  AttendanceConfirmation: {
    display: "flex",
    maxWidth: theme.containerMaxWidth,
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: theme.formBackground,
    color: theme.secondFont,
    borderRadius: "0.5em",
    padding: "5vw",
    paddingTop: "2rem",
    paddingBottom: "2rem",
    lineHeight: theme.bodyLineHeight,
    fontSize: theme.bodyFontSize,
    marginBottom: "2rem",
    // fill container
    boxSizing: "border-box"
  },
  header: {
    padding: "10px"
  },
  locationMessage: {
    lineHeight: "1.1em",
    maxWidth: theme.containerMaxWidth
  },
  [`@media(max-width: ${theme.mediumBreakpoint})`]: {
    header: {
      maxWidth: "7em"
    }
  },
});

const AttendanceConfirmation: React.FunctionComponent<Props> = ({
  classes,
  confirmFormData
}) => {
  const locationToReadable = (location: string): string => {
    if (location == "cannot-attend") {
      return "Can't Attend 😔"
    }

    return location
      .split("-")
      .map(word => word.toUpperCase())
      .join(" ")
      + " 😎";
  };
  let isAttending, locationMessage, postMessage;

  isAttending = confirmFormData.location !== "cannot-attend";
  if (isAttending) {
    locationMessage = "You are confirmed for: ";
    postMessage =
      "See you at the event! If you can no longer attend the event, please update your response below.";
  } else {
    locationMessage = "Your status: ";
    postMessage =
      "We're sorry to see you can't attend. Hope to see at our event next year!";
  }

  return (
    <div className={classes.AttendanceConfirmation}>
      <h1 className={classes.header}> Thanks for responding to us! </h1>
      <Underline />
      <p className={classes.locationMessage}>
        {locationMessage} {locationToReadable(confirmFormData.location)}
      </p>
      <p>{postMessage}</p>
    </div>
  );
};

const mapStateToProps = (state: ReduxState) => ({
  user: state.core.user,
  confirmFormData: state.core.confirmForm.formData,
});

export default compose(
  injectSheet(styles),
  connect(mapStateToProps)
)(AttendanceConfirmation);
