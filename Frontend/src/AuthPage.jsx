import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const initialFormState = {
  username: "",
  email: "",
  password: "",
};

const socialButtons = [
  { label: "Google", symbol: "G" },
];

const AuthPage = () => { 
  const navigate = useNavigate();
  const [mode, setMode] = useState("signin");
  const [formData, setFormData] = useState(initialFormState);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const isSignIn = mode === "signin";

  const heading = useMemo(
    () => (isSignIn ? "Sign in with email" : "Create your account"),
    [isSignIn],
  );

  const description = useMemo(
    () =>
      isSignIn
        ? "Access your workspace, keep your campaigns moving, and pick up where you left off."
        : "Set up your account to start creating, editing, and launching ads in one place.",
    [isSignIn],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setStatus("");

    try {
      const endpoint = isSignIn ? "/api/auth/login" : "/api/auth/register";
      const payload = isSignIn
        ? {
            email: formData.email,
            password: formData.password,
          }
        : {
            username: formData.username,
            email: formData.email,
            password: formData.password,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Something went wrong");
      }

      const accessToken = data.Accesstoken ?? data.accessToken;

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
      }

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      if (isSignIn) {
        setStatus(data?.message || "Signed in successfully.");
        navigate("/dashboard")
      } else {
        setStatus(
          data?.message || "Account created successfully. Sign in to continue.",
        );
        setMode("signin");
      }

      setFormData((current) => ({
        ...current,
        password: "",
      }));
    } catch (submitError) {
      setError(submitError.message || "Unable to submit the form");
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setError("");
    setStatus("");
    setShowPassword(false);
    setFormData((current) => ({
      ...current,
      password: "",
    }));
  };

  return (
    <main className="auth-page">
      <div className="auth-page__glow auth-page__glow--left" />
      <div className="auth-page__glow auth-page__glow--right" />
      <div className="auth-page__cloud auth-page__cloud--left" />
      <div className="auth-page__cloud auth-page__cloud--right" />

      <header className="brand-bar" aria-label="Brand">
        <div className="brand-bar__mark">A</div>
        <div>
          <p className="brand-bar__name">AdVantage Gen</p>
          <p className="brand-bar__tag">AI ad studio</p>
        </div>
      </header>

      <section className="auth-shell">
        <div className="auth-card">
          <div className="auth-card__badge" aria-hidden="true">
            {isSignIn ? "->" : "+"}
          </div>

          <div className="auth-card__header">
            <p className="auth-card__eyebrow">
              {isSignIn ? "Welcome back" : "Start here"}
            </p>
            <h1>{heading}</h1>
            <p>{description}</p>
          </div>

          <div
            className="auth-toggle"
            role="tablist"
            aria-label="Authentication mode"
          >
            <button
              type="button"
              className={
                isSignIn
                  ? "auth-toggle__button is-active"
                  : "auth-toggle__button"
              }
              onClick={() => handleModeChange("signin")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={
                !isSignIn
                  ? "auth-toggle__button is-active"
                  : "auth-toggle__button"
              }
              onClick={() => handleModeChange("signup")}
            >
              Sign up
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {!isSignIn && (
              <label className="field">
                <span>Username</span>
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                  placeholder="Your display name"
                  required={!isSignIn}
                />
              </label>
            )}

            <label className="field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder="name@company.com"
                required
              />
            </label>

            <label className="field">
              <span>Password</span>
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete={isSignIn ? "current-password" : "new-password"}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-field__toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>


            {error && (
              <p className="feedback feedback--error" role="alert">
                {error}
              </p>
            )}
            {status && (
              <p className="feedback feedback--success" role="status">
                {status}
              </p>
            )}

            <button
              type="submit"
              className="auth-form__submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : isSignIn
                  ? "Get started"
                  : "Create account"}
            </button>
          </form>

          <div className="divider">
            <span>Or continue with</span>
          </div>

          <div className="social-row">
            {socialButtons.map((item) => (
              <button
                key={item.label}
                type="button"
                className="social-row__button"
                aria-label={item.label}
              >
                <span>{item.symbol}</span>
              </button>
            ))}
          </div>

          <p className="auth-card__switch">
            {isSignIn ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              className="link-button"
              onClick={() => handleModeChange(isSignIn ? "signup" : "signin")}
            >
              {isSignIn ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
};

export default AuthPage;
