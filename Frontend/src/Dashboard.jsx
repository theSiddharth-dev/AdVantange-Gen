import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const initialFormState = {
  prompt: "",
  tone: "professional",
  logo: "",
};

const toneOptions = [
  "professional",
  "bold",
  "luxury",
  "playful",
  "minimal",
  "friendly",
];

const formatDate = (value) => {
  if (!value) {
    return "Just now";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const getStoredAccessToken = () => localStorage.getItem("accessToken");

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedAd, setGeneratedAd] = useState(null);
  const [recentAds, setRecentAds] = useState([]);

  const user = getStoredUser();

  useEffect(() => {
    const loadRecentAds = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const userId = user?._id;
        const accessToken = getStoredAccessToken();
        const queryString = userId
          ? `?userId=${encodeURIComponent(userId)}`
          : "";
        const response = await fetch(`${apiUrl}/api/Ad/recent${queryString}`, {
          credentials: "include",
          headers: accessToken
            ? {
                Authorization: `Bearer ${accessToken}`,
              }
            : undefined,
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Unable to load recent ads");
        }

        const ads = data.ads || [];

        setRecentAds(ads);
        setGeneratedAd((current) => current || ads[0] || null);
      } catch {
        setRecentAds([]);
      }
    };

    loadRecentAds();
  }, [user?._id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleGenerate = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const accessToken = getStoredAccessToken();
      const response = await fetch(`${apiUrl}/api/Ad/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken
            ? {
                Authorization: `Bearer ${accessToken}`,
              }
            : {}),
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to generate ad");
      }

      const nextAd = data.ad || {
        ...data.data,
        imageUrl: data.imageUrl,
        finalImageUrl: data.finalImageUrl,
      };

      setGeneratedAd({
        ...nextAd,
        generatedCopy: data.data,
      });
      setRecentAds((current) => {
        const nextAds = [
          nextAd,
          ...current.filter((ad) => ad._id !== nextAd._id),
        ];
        return nextAds;
      });
    } catch (submitError) {
      setError(submitError.message || "Unable to generate ad");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: "GET",
        credentials: "include",
      });
    } catch {
      // ignore network errors on logout
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-header__eyebrow">Ad workspace</p>
          <h1>Welcome{user?.username ? `, ${user.username}` : ""}</h1>
          <p>{user?.email || ""}</p>
        </div>
        <button className="dashboard-header__logout" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="dashboard-grid">
        <section className="dashboard-panel dashboard-panel--editor">
          <div className="dashboard-panel__header">
            <div>
              <p className="dashboard-panel__eyebrow">Editor</p>
              <h2>Create ad</h2>
            </div>
            <p className="dashboard-panel__hint">
              Build the prompt you want to generate.
            </p>
          </div>

          <form className="dashboard-form" onSubmit={handleGenerate}>
            <label className="dashboard-field dashboard-field--full">
              <span>Prompt</span>
              <textarea
                name="prompt"
                value={formData.prompt}
                onChange={handleChange}
                placeholder="Describe the brand, product, campaign goal, or style..."
                rows="7"
                required
              />
            </label>

            <label className="dashboard-field">
              <span>Tone</span>
              <select name="tone" value={formData.tone} onChange={handleChange}>
                {toneOptions.map((tone) => (
                  <option key={tone} value={tone}>
                    {tone}
                  </option>
                ))}
              </select>
            </label>

            <label className="dashboard-field">
              <span>Logo URL</span>
              <input
                name="logo"
                value={formData.logo}
                onChange={handleChange}
                placeholder="Optional logo image URL"
              />
            </label>

            {error && (
              <p className="dashboard-feedback dashboard-feedback--error">
                {error}
              </p>
            )}

            <button
              className="dashboard-form__submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate ad"}
            </button>
          </form>
        </section>

        <section className="dashboard-panel dashboard-panel--console">
          <div className="dashboard-panel__header">
            <div>
              <p className="dashboard-panel__eyebrow">Console</p>
              <h2>Generated output ad</h2>
            </div>
            <p className="dashboard-panel__hint">
              Latest response from the generator.
            </p>
          </div>

          {generatedAd ? (
            <div className="dashboard-console">
              <div className="dashboard-console__hero">
                {generatedAd.finalImageUrl ? (
                  <img
                    src={generatedAd.finalImageUrl}
                    alt={generatedAd.title || "Generated ad"}
                  />
                ) : (
                  <div className="dashboard-console__placeholder">
                    No image preview
                  </div>
                )}
              </div>

              <div className="dashboard-console__body">
                <div>
                  <p className="dashboard-console__label">Title</p>
                  <h3>
                    {generatedAd.generatedCopy?.title ||
                      generatedAd.title ||
                      "Generated ad"}
                  </h3>
                </div>
                <p className="dashboard-console__copy">
                  {generatedAd.generatedCopy?.subtitle ||
                    generatedAd.subtitle ||
                    generatedAd.caption ||
                    "No subtitle returned."}
                </p>
                <div className="dashboard-console__chips">
                  {(
                    generatedAd.generatedCopy?.hashtags ||
                    generatedAd.hashtags ||
                    []
                  ).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <div className="dashboard-console__meta">
                  <div>
                    <p className="dashboard-console__label">CTA</p>
                    <strong>
                      {generatedAd.generatedCopy?.cta || "Learn More"}
                    </strong>
                  </div>
                  <div>
                    <p className="dashboard-console__label">Prompt</p>
                    <strong>{generatedAd.prompt}</strong>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="dashboard-empty-state">
              Generate an ad to see the console output here.
            </div>
          )}
        </section>

        <section className="dashboard-panel dashboard-panel--recent">
          <div className="dashboard-panel__header">
            <div>
              <p className="dashboard-panel__eyebrow">Recent Ads</p>
              <h2>All generated ads</h2>
            </div>
            <p className="dashboard-panel__hint">
              Every saved generation appears here.
            </p>
          </div>

          <div className="dashboard-recent-list">
            {recentAds.length ? (
              recentAds.map((ad) => (
                <article
                  className="dashboard-recent-card"
                  key={ad._id || `${ad.prompt}-${ad.createdAt}`}
                >
                  <div className="dashboard-recent-card__thumb">
                    {ad.finalImageUrl ? (
                      <img
                        src={ad.finalImageUrl}
                        alt={ad.caption || ad.prompt || "Generated ad"}
                      />
                    ) : (
                      <span>No preview</span>
                    )}
                  </div>
                  <div className="dashboard-recent-card__content">
                    <div>
                      <h3>
                        {ad.caption ||
                          ad.refinedPrompt ||
                          ad.prompt ||
                          "Generated ad"}
                      </h3>
                      <p>{ad.prompt || "No prompt provided"}</p>
                    </div>
                    <div className="dashboard-recent-card__meta">
                      <span>{formatDate(ad.createdAt)}</span>
                      {ad.hashtags?.length ? (
                        <span>{ad.hashtags.slice(0, 3).join(" ")}</span>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="dashboard-empty-state">No ads generated yet.</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
