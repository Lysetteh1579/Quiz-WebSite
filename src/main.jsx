import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
import { useLayoutEffect } from "react";
import {
  ClerkProvider,
  SignIn,
  SignUp,
  useClerk,
  useUser,
} from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { Link, Route, Router as WouterRouter, Switch, useLocation } from "wouter";
import "./auth.css";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

if (!clerkPubKey) {
  throw new Error("Missing the Clerk publishable key. Check the app's Auth setup.");
}

const clerkAppearance = {
  theme: "simple",
  options: {
    logoPlacement: "inside",
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
    socialButtonsPlacement: "top",
    socialButtonsVariant: "blockButton",
  },
  variables: {
    colorPrimary: "#4359ed",
    colorForeground: "#19234b",
    colorMutedForeground: "#66708f",
    colorDanger: "#d9572b",
    colorBackground: "#ffffff",
    colorInput: "#f4f6ff",
    colorInputForeground: "#19234b",
    colorNeutral: "#68739a",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    borderRadius: "14px",
  },
  elements: {
    rootBox: {
      display: "flex",
      width: "100%",
      justifyContent: "center",
    },
    cardBox: {
      width: "min(440px, calc(100vw - 32px))",
      maxWidth: "100%",
      overflow: "hidden",
      borderRadius: "24px",
      backgroundColor: "#ffffff",
      boxShadow: "0 18px 48px rgba(38, 51, 104, 0.16)",
    },
    card: {
      border: "0",
      backgroundColor: "transparent",
      boxShadow: "none",
    },
    footer: {
      border: "0",
      backgroundColor: "transparent",
      boxShadow: "none",
    },
    headerTitle: {
      color: "#19234b",
      fontFamily: '"DM Sans", system-ui, sans-serif',
      fontWeight: "800",
    },
    headerSubtitle: { color: "#68675d" },
    socialButtonsBlockButtonText: { color: "#2f3029" },
    socialButtonsBlockButton: {
      border: "1px solid #e1e6f5",
      borderRadius: "12px",
      backgroundColor: "#f4f6ff",
    },
    formFieldLabel: { color: "#19234b" },
    formFieldInput: {
      borderColor: "#e1e6f5",
      borderRadius: "12px",
      backgroundColor: "#f4f6ff",
      color: "#19234b",
    },
    formButtonPrimary: {
      borderRadius: "12px",
      backgroundColor: "#4359ed",
      color: "#ffffff",
    },
    footerActionText: { color: "#66708f" },
    footerActionLink: { color: "#3448d2" },
    dividerText: { color: "#66708f" },
    dividerLine: { backgroundColor: "#e1e6f5" },
    identityPreviewEditButton: { color: "#4057ed" },
    formFieldSuccessText: { color: "#168071" },
    alertText: { color: "#d9572b" },
    alert: { color: "#d9572b" },
    otpCodeFieldInput: {
      borderColor: "#e1e6f5",
      backgroundColor: "#f4f6ff",
      color: "#19234b",
    },
  },
};

function stripBase(path) {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

function AuthNav() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded) return null;

  if (isSignedIn) {
    const name = user.firstName || user.username || "there";
    return (
      <div className="auth-nav">
        <span className="account-greeting">Hi, {name}</span>
        <button
          className="nav-link auth-signout"
          type="button"
          onClick={() => signOut({ redirectUrl: basePath || "/" })}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="auth-nav">
      <Link className="nav-link auth-link" href="/sign-in">
        Log in
      </Link>
      <Link className="button button-coral button-small" href="/sign-up">
        Join
      </Link>
    </div>
  );
}

function SignInPage() {
  return (
    <main className="auth-scene">
      <div className="auth-content">
        <Link className="auth-brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            <img src={`${basePath}/logo.svg`} alt="" />
          </span>
          <span className="brand-copy">
            <strong>Lystte <span>Quiz</span></strong>
            <small>A little quiz club</small>
          </span>
        </Link>
        <p className="auth-note">Your little corner of the quiz shelf.</p>
        <SignIn
          routing="path"
          path={`${basePath}/sign-in`}
          signUpUrl={`${basePath}/sign-up`}
        />
        <Link className="auth-back-link" href="/">
          Back to the quizzes
        </Link>
      </div>
    </main>
  );
}

function SignUpPage() {
  return (
    <main className="auth-scene">
      <div className="auth-content">
        <Link className="auth-brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            <img src={`${basePath}/logo.svg`} alt="" />
          </span>
          <span className="brand-copy">
            <strong>Lystte <span>Quiz</span></strong>
            <small>A little quiz club</small>
          </span>
        </Link>
        <p className="auth-note">Make an account and join the quiz club.</p>
        <SignUp
          routing="path"
          path={`${basePath}/sign-up`}
          signInUrl={`${basePath}/sign-in`}
        />
        <Link className="auth-back-link" href="/">
          Back to the quizzes
        </Link>
      </div>
    </main>
  );
}

function AuthRoutes() {
  const [location, setLocation] = useLocation();
  const isAuthPage =
    location.startsWith("/sign-in") || location.startsWith("/sign-up");
  const navRoot = document.getElementById("auth-nav-root");

  useLayoutEffect(() => {
    document.body.classList.toggle("auth-route", isAuthPage);
  }, [isAuthPage]);

  return (
    <>
      {navRoot && createPortal(<AuthNav />, navRoot)}
      <Switch>
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route>{null}</Route>
      </Switch>
    </>
  );
}

function ClerkApp() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to your Lystte Quiz account.",
          },
        },
        signUp: {
          start: {
            title: "Join the quiz club",
            subtitle: "Create your Lystte Quiz account.",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <AuthRoutes />
    </ClerkProvider>
  );
}

if (
  window.location.pathname.startsWith(`${basePath}/sign-in`) ||
  window.location.pathname.startsWith(`${basePath}/sign-up`)
) {
  document.body.classList.add("auth-route");
}

createRoot(document.getElementById("auth-root")).render(
  <WouterRouter base={basePath}>
    <ClerkApp />
  </WouterRouter>,
);
