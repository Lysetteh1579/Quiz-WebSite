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
    colorPrimary: "#e66c4d",
    colorForeground: "#2f3029",
    colorMutedForeground: "#77766c",
    colorDanger: "#b84e37",
    colorBackground: "#fffdf7",
    colorInput: "#fffaf1",
    colorInputForeground: "#2f3029",
    colorNeutral: "#897c66",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    borderRadius: "16px",
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
      backgroundColor: "#fffdf7",
      boxShadow: "0 18px 48px rgba(47, 48, 41, 0.12)",
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
      color: "#2f3029",
      fontFamily: '"Fraunces", Georgia, serif',
    },
    headerSubtitle: { color: "#68675d" },
    socialButtonsBlockButtonText: { color: "#2f3029" },
    socialButtonsBlockButton: {
      border: "1px solid #e9dfcc",
      borderRadius: "999px",
      backgroundColor: "#fffaf1",
    },
    formFieldLabel: { color: "#2f3029" },
    formFieldInput: {
      borderColor: "#e9dfcc",
      borderRadius: "12px",
      backgroundColor: "#fffaf1",
      color: "#2f3029",
    },
    formButtonPrimary: {
      borderRadius: "999px",
      backgroundColor: "#e66c4d",
      color: "#fffdf7",
    },
    footerActionText: { color: "#68675d" },
    footerActionLink: { color: "#b84e37" },
    dividerText: { color: "#77766c" },
    dividerLine: { backgroundColor: "#e9dfcc" },
    identityPreviewEditButton: { color: "#276e67" },
    formFieldSuccessText: { color: "#276e67" },
    alertText: { color: "#b84e37" },
    alert: { color: "#b84e37" },
    otpCodeFieldInput: {
      borderColor: "#e9dfcc",
      backgroundColor: "#fffaf1",
      color: "#2f3029",
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
