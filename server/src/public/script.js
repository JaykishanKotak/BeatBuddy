const getById = (id) => {
  return document.getElementById(id);
};

const password = getById("password");
const confirmPassword = getById("confirm-password");
const form = getById("form");
const container = getById("container");
const loader = getById("loader");
const button = getById("submit");

const error = getById("error");
const success = getById("success");

error.style.display = "none";
success.style.display = "none";
container.style.display = "none";

/** Sample url
 * http://localhost:9999/reset-password.html?token=a32dad2aa4cbd85970f4dbb057fa1cb62fd80e2e30314eaa85c5a026f386403350c2c7bb&userId=65ae29e1faff322397707b1a
 */
//Runs whenever user hit the route first time

let token, userId;
const passwordRegex =
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]+$/;

window.addEventListener("DOMContentLoaded", async () => {
  //Search will return things after ("?") mark => token and userId
  //new Proxy allow use to use get / set methods
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => {
      return searchParams.get(prop);
    },
  });
  token = params.token;
  userId = params.userId;
  //   console.log(params.token, params.userId);

  //token verifiaction
  const res = await fetch("/auth/verify-pass-reset-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({ token, userId }),
  });

  //error handleing
  if (!res.ok) {
    const { error } = await res.json();
    loader.innerText = error;
    return;
  }

  loader.style.display = "none";
  container.style.display = "block";
});

const displayError = (errorMessage) => {
  //remove success message if any,
  success.style.display = "none";

  //add and display error message
  error.innerText = errorMessage;
  error.style.display = "block";
};

const displaySuccess = (successMessage) => {
  //remove error message if any,
  error.style.display = "none";

  //add and display success message
  success.innerText = successMessage;
  success.style.display = "block";
};

const handleSubmit = async (evt) => {
  evt.preventDefault();

  console.log("Submitting ...");
  //validate
  if (!password.value.trim()) {
    displayError("Password is missing !");
    return;
  }
  if (!passwordRegex.test(password.value)) {
    displayError(
      "Password is too simple, please use alphanumeric with special characters !"
    );
    return;
  }
  if (password.value !== confirmPassword.value) {
    console.log(password.value, confirmPassword.value);
    displayError("Password do not match !");
    return;
  }

  button.disabled = true;
  button.innerText = "Please wait..";
  //submit logic
  const res = await fetch("/auth/update-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({ token, userId, password: password.value }),
  });

  button.disabled = false;
  button.innerText = "Reset Password";

  //error handleing
  if (!res.ok) {
    const { error } = await res.json();
    displayError(error);
    return;
  }

  //success
  displaySuccess("Your password is reset successfully !");

  //reseting the form
  password.value = "";
  confirmPassword.value = "";
};

form.addEventListener("submit", handleSubmit);
