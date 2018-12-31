import { db, auth, provider, storage } from "../../firebase";
import { push } from "connected-react-router";

import { UNRESTRICTED_ROUTES } from "../constants";

export const REFRESH_WINDOW_DIMENSIONS = "core/REFRESH_WINDOW_DIMENSIONS";

export const SUBMIT_APP_PENDING = "core/SUBMIT_APP_PENDING";
export const SUBMIT_APP_FULFILLED = "core/SUBMIT_APP_FULFILLED";
export const SUBMIT_APP_REJECTED = "core/SUBMIT_APP_REJECTED";

export const LOGIN_PENDING = "core/LOGIN_PENDING";
export const LOGIN_FULFILLED = "core/LOGIN_FULFILLED";
export const LOGIN_REJECTED = "core/LOGIN_REJECTED";

export const REGISTER_PENDING = "core/REGISTER_PENDING";
export const REGISTER_FULFILLED = "core/REGISTER_FULFILLED";
export const REGISTER_REJECTED = "core/REGISTER_REJECTED";

export const LOGOUT_FULFILLED = "core/LOGOUT_FULFILLED";
export const LOGOUT_REJECTED = "core/LOGOUT_REJECTED";

export const RESET_PASSWORD_PENDING = "core/RESET_PASSWORD_PENDING";
export const RESET_PASSWORD_FULFILLED = "core/RESET_PASSWORD_FULFILLED";
export const RESET_PASSWORD_REJECTED = "core/RESET_PASSWORD_REJECTED";

export const UPDATE_PASSWORD_PENDING = "core/UPDATE_PASSWORD_PENDING";
export const UPDATE_PASSWORD_FULFILLED = "core/UPDATE_PASSWORD_FULFILLED";
export const UPDATE_PASSWORD_REJECTED = "core/UPDATE_PASSWORD_REJECTED";

export const CLEAR_EMAIL_STATE = "core/CLEAR_EMAIL_STATE";

export const CLEAR_ERROR = "core/CLEAR_ERROR";
export const CLEAR_NOTIFICATION = "core/CLEAR_NOTIFICATION";

export const UPLOAD_RESUME_PENDING = "core/UPLOAD_RESUME_PENDING";
export const UPLOAD_RESUME_FULFILLED = "core/UPLOAD_RESUME_FULFILLED";
export const UPLOAD_RESUME_REJECTED = "core/UPLOAD_RESUME_REJECTED";

export const ADD_USER = "core/ADD_USER";
export const DELETE_USER = "core/DELETE_USER";
export const UPLOAD_PROFILE_PICTURE_PENDING =
  "core/UPLOAD_PROFILE_PICTURE_PENDING";

export const UPLOAD_PROFILE_PICTURE_REJECTED =
  "core/UPLOAD_PROFILE_PICTURE_REJECTED";

export const UPLOAD_PROFILE_PICTURE_FULFILLED =
  "core/UPLOAD_PROFILE_PICTURE_FULFILLED";

export const refreshWindowDimensions = () => ({
  type: REFRESH_WINDOW_DIMENSIONS,
  payload: {}
});

export const loadInitialState = location => dispatch => {
  auth.onAuthStateChanged(user => {
    if (user) {
      dispatch({
        type: ADD_USER,
        payload: user
      });
    } else {
      // If not in the routes that are unrestricted,
      // redirect to login. I'm filtering by unrestricted
      // because I'd prefer to accidentally redirect to login
      // versus accidentally showing restricted pages
      if (!UNRESTRICTED_ROUTES.has(location.pathname)) {
        dispatch(push("/login"));
      }
      dispatch({
        type: DELETE_USER
      });
    }
  });
};

export const uploadResume = (uid, file) => dispatch => {
  dispatch({
    type: UPLOAD_RESUME_PENDING
  });
  if (file.type !== "application/pdf") {
    dispatch({
      type: UPLOAD_RESUME_REJECTED,
      payload: { message: "Invalid file type, resume must be a PDF" }
    });
    return;
  }

  const storageRef = storage.ref();
  const resumeRef = storageRef.child(`users/${uid}/resume.pdf`);
  return resumeRef
    .put(file)
    .then(() => {
      const resumeTimestamp = new Date().toLocaleString();
      return db
        .collection("users")
        .doc(uid)
        .update({ resumeTimestamp })
        .then(() => resumeTimestamp);
    })
    .then(timestamp => {
      dispatch({
        type: UPLOAD_RESUME_FULFILLED,
        payload: "Resume successfully uploaded"
      });

      return timestamp;
    })
    .catch(err => dispatch({ type: UPLOAD_RESUME_REJECTED, payload: err }));
};

// incomplete is a list of all incompleted form items
export const submitApp = (appValues, incomplete) => dispatch => {
  let isComplete = incomplete.length === 0;

  if (!auth.currentUser) {
    dispatch({
      type: SUBMIT_APP_REJECTED,
      payload: "Not logged in, please log in to submit app"
    });
    dispatch(push("/login"));
    return;
  }
  let msg;
  const currentTime = new Date();
  if (isComplete) {
    appValues.submittedDate = currentTime.toISOString();
    msg = `Application submitted at ${currentTime.toLocaleString()}. Feel free to resubmit at any time.`;
  } else {
    // this a bit of a hack, but it works great! splits the incomplete field names (which are camel case) to human friendly strs
    const readify = list =>
      list
        .map(val =>
          val
            .split(/(?=[A-Z])/)
            .join(" ")
            .toLowerCase()
        )
        .join(", ");

    msg = "Application saved but NOT complete. Missing: " + readify(incomplete);
  }

  const uid = auth.currentUser.uid;
  dispatch({
    type: SUBMIT_APP_PENDING
  });
  return db
    .collection("users")
    .doc(uid)
    .set(appValues)
    .then(() =>
      dispatch({
        type: SUBMIT_APP_FULFILLED,
        payload: msg
      })
    )
    .catch(err =>
      dispatch({
        type: SUBMIT_APP_REJECTED,
        payload: err
      })
    );
};

export const logout = () => dispatch => {
  auth
    .signOut()
    .then(() => {
      dispatch({
        type: LOGOUT_FULFILLED,
        payload: "Successfully logged out"
      });
      dispatch(push("/"));
    })
    .catch(err => {
      dispatch({
        type: LOGOUT_REJECTED,
        payload: err
      });
    });
};

// Directly add user for rehydrating from localStorage
export const addUser = user => ({
  type: ADD_USER,
  payload: user
});

export const deleteUser = () => ({
  type: DELETE_USER
});

export const loginWithPassword = ({ password, email }) => dispatch => {
  dispatch({ type: LOGIN_PENDING });
  auth
    .signInWithEmailAndPassword(email, password)
    .then(result => {
      const { user } = result;
      dispatch({
        type: LOGIN_FULFILLED,
        payload: user
      });
      dispatch(push("/apply"));
    })
    .catch(err => {
      dispatch({
        type: LOGIN_REJECTED,
        payload: err
      });
    });
};

export const loginWithGoogle = () => dispatch => {
  dispatch({ type: LOGIN_PENDING });
  auth
    .signInWithPopup(provider)
    .then(result => {
      const { user } = result;
      dispatch({
        type: LOGIN_FULFILLED,
        payload: user
      });
      dispatch(push("/apply"));
    })
    .catch(err => {
      dispatch({
        type: LOGIN_REJECTED,
        payload: err
      });
    });
};

export const register = ({ email, password }) => dispatch => {
  dispatch({ type: REGISTER_PENDING });
  auth
    .createUserWithEmailAndPassword(email, password)
    .then(result => {
      const { user } = result;
      dispatch({
        type: REGISTER_FULFILLED,
        payload: user
      });
      dispatch(push("/apply"));
    })
    .catch(err => {
      dispatch({
        type: REGISTER_REJECTED,
        payload: err
      });
    });
};

export const resetPassword = email => dispatch => {
  dispatch({ type: RESET_PASSWORD_PENDING });
  auth
    .sendPasswordResetEmail(email)
    .then(result => {
      dispatch({
        type: RESET_PASSWORD_FULFILLED,
        payload: result
      });
    })
    .catch(err => {
      dispatch({
        type: RESET_PASSWORD_REJECTED,
        payload: err
      });
    });
};

export const updatePassword = password => dispatch => {
  dispatch({ type: UPDATE_PASSWORD_PENDING });
  auth.currentUser
    .updatePassword(password)
    .then(() => {
      dispatch({ type: UPDATE_PASSWORD_FULFILLED });
      dispatch(push("/"));
    })
    .catch(err => dispatch({ type: UPDATE_PASSWORD_REJECTED, payload: err }));
};

export const clearEmailState = () => ({
  type: CLEAR_EMAIL_STATE
});

export const clearError = errorType => ({
  type: CLEAR_ERROR,
  payload: errorType
});

export const clearNotification = errorType => ({
  type: CLEAR_NOTIFICATION,
  payload: errorType
});

export const uploadProfilePic = (file, uid) => dispatch => {
  dispatch({ type: UPLOAD_PROFILE_PICTURE_PENDING });
  const validFileTypes = new Set(["image/png", "image/jpg", "image/jpeg"]);

  if (validFileTypes.has(file.type)) {
    const ext = file.name.split(".").pop();
    const storageRef = storage.ref();
    const imageRef = storageRef.child(`users/${uid}/profile.${ext}`);
    let photoURL;
    imageRef
      .put(file)
      .then(() => imageRef.getDownloadURL())
      .then(url => {
        photoURL = url;
        return auth.currentUser.updateProfile({
          photoURL: url
        });
      })
      .then(() => {
        dispatch({
          type: UPLOAD_PROFILE_PICTURE_FULFILLED,
          payload: photoURL
        });
      })
      .catch(err => {
        dispatch({
          type: UPLOAD_PROFILE_PICTURE_REJECTED,
          payload: err
        });
      });
  } else {
    dispatch({
      type: UPLOAD_PROFILE_PICTURE_REJECTED,
      payload: "Invalid file type " + file.type.split("/").pop()
    });
  }
};
