package com.examjk.app;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.app.DownloadManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.PermissionRequest;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

public class MainActivity extends AppCompatActivity {

    private static final String PREFS_NAME = "ExamJKPrefs";
    private static final String KEY_SERVER_URL = "server_url";
    private static final String DEFAULT_URL = "https://examjk.com";

    private View rootContainer;
    private WebView webView;
    private SwipeRefreshLayout swipeRefresh;
    private ProgressBar progressBar;
    private LinearLayout offlineView;
    private Button btnRetry;

    private ValueCallback<Uri[]> filePathCallback;
    private long backPressedTime = 0;
    private SharedPreferences prefs;
    private volatile boolean isPdfOpen = false;

    // Activity Result Launcher for file upload chooser
    private final ActivityResultLauncher<Intent> fileChooserLauncher =
            registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
                if (filePathCallback != null) {
                    Uri[] results = null;
                    if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                        if (result.getData().getClipData() != null) {
                            int count = result.getData().getClipData().getItemCount();
                            results = new Uri[count];
                            for (int i = 0; i < count; i++) {
                                results[i] = result.getData().getClipData().getItemAt(i).getUri();
                            }
                        } else if (result.getData().getData() != null) {
                            results = new Uri[]{result.getData().getData()};
                        }
                    }
                    filePathCallback.onReceiveValue(results);
                    filePathCallback = null;
                }
            });

    // Permission launcher for microphone / camera
    private final ActivityResultLauncher<String[]> permissionLauncher =
            registerForActivityResult(new ActivityResultContracts.RequestMultiplePermissions(), permissions -> {
                // Handled gracefully in web app
            });

    @Override
    @SuppressLint("SetJavaScriptEnabled")
    protected void onCreate(Bundle savedInstanceState) {
        // Switch back to normal theme from splash theme
        setTheme(R.style.Theme_ExamJK);
        super.onCreate(savedInstanceState);
        setupStatusBar();
        setContentView(R.layout.activity_main);

        prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);

        rootContainer = findViewById(R.id.root_container);
        webView = findViewById(R.id.webview);
        swipeRefresh = findViewById(R.id.swipe_refresh);
        progressBar = findViewById(R.id.progress_bar);
        offlineView = findViewById(R.id.offline_view);
        btnRetry = findViewById(R.id.btn_retry);

        setupWindowInsets();
        setupWebView();
        setupSwipeRefresh();
        setupBackNavigation();
        requestRequiredPermissions();
        registerNetworkCallback();

        btnRetry.setOnClickListener(v -> loadExamJK());

        loadExamJK();
    }

    @Override
    protected void onResume() {
        super.onResume();
        enforceNonOverlappingStatusBar();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            enforceNonOverlappingStatusBar();
        }
    }

    @Override
    public void onConfigurationChanged(@NonNull Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        enforceNonOverlappingStatusBar();
    }

    private void enforceNonOverlappingStatusBar() {
        setupStatusBar();
        if (rootContainer != null) {
            ViewCompat.requestApplyInsets(rootContainer);
        }
    }

    private void setupStatusBar() {
        Window window = getWindow();
        if (window == null) return;

        // Explicitly disable edge-to-edge so WebView content never renders behind system bars
        WindowCompat.setDecorFitsSystemWindows(window, true);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams lp = window.getAttributes();
            lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_NEVER;
            window.setAttributes(lp);
        }

        // Remove any fullscreen, translucent, or layout-under-bars flags
        window.clearFlags(
                WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS
                | WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION
                | WindowManager.LayoutParams.FLAG_FULLSCREEN
                | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
                | WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN
        );
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);

        int primaryColor = ContextCompat.getColor(this, R.color.primary); // #003b73 Navy Blue
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.setStatusBarColor(primaryColor);
            window.setNavigationBarColor(primaryColor);
        }

        View decorView = window.getDecorView();
        WindowInsetsControllerCompat insetsController = WindowCompat.getInsetsController(window, decorView);
        if (insetsController != null) {
            insetsController.show(WindowInsetsCompat.Type.statusBars());
            insetsController.show(WindowInsetsCompat.Type.navigationBars());
            // Light (white) icons on dark #003b73 navy background
            insetsController.setAppearanceLightStatusBars(false);
            insetsController.setAppearanceLightNavigationBars(false);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            WindowInsetsController controller = window.getInsetsController();
            if (controller != null) {
                controller.show(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                controller.setSystemBarsAppearance(0, WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS);
            }
        } else {
            int clearFlags = View.SYSTEM_UI_FLAG_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    | View.SYSTEM_UI_FLAG_IMMERSIVE
                    | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                clearFlags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            }
            decorView.setSystemUiVisibility(decorView.getSystemUiVisibility() & ~clearFlags);
        }
    }

    private void setupWindowInsets() {
        if (rootContainer == null) return;
        ViewCompat.setOnApplyWindowInsetsListener(rootContainer, (v, windowInsets) -> {
            Insets systemAndCutout = windowInsets.getInsets(
                    WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout()
            );
            Insets imeInsets = windowInsets.getInsets(WindowInsetsCompat.Type.ime());
            int bottomPadding = Math.max(systemAndCutout.bottom, imeInsets.bottom);
            v.setPadding(
                    systemAndCutout.left,
                    systemAndCutout.top,
                    systemAndCutout.right,
                    bottomPadding
            );
            return WindowInsetsCompat.CONSUMED;
        });
        ViewCompat.requestApplyInsets(rootContainer);
    }

    private void requestRequiredPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            String[] permissions = new String[]{
                    Manifest.permission.RECORD_AUDIO,
                    Manifest.permission.CAMERA
            };
            permissionLauncher.launch(permissions);
        }
    }

    private boolean isNetworkConnected() {
        try {
            android.net.ConnectivityManager cm = (android.net.ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
            if (cm != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    android.net.Network network = cm.getActiveNetwork();
                    if (network != null) {
                        android.net.NetworkCapabilities capabilities = cm.getNetworkCapabilities(network);
                        return capabilities != null && (
                                capabilities.hasTransport(android.net.NetworkCapabilities.TRANSPORT_WIFI) ||
                                capabilities.hasTransport(android.net.NetworkCapabilities.TRANSPORT_CELLULAR) ||
                                capabilities.hasTransport(android.net.NetworkCapabilities.TRANSPORT_ETHERNET));
                    }
                } else {
                    android.net.NetworkInfo activeNetwork = cm.getActiveNetworkInfo();
                    return activeNetwork != null && activeNetwork.isConnected();
                }
            }
        } catch (Exception ignored) {}
        return false;
    }

    private void registerNetworkCallback() {
        try {
            android.net.ConnectivityManager cm = (android.net.ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
            if (cm != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                cm.registerDefaultNetworkCallback(new android.net.ConnectivityManager.NetworkCallback() {
                    @Override
                    public void onAvailable(@NonNull android.net.Network network) {
                        runOnUiThread(() -> {
                            if (webView != null) {
                                webView.getSettings().setCacheMode(WebSettings.LOAD_DEFAULT);
                                if (offlineView != null && offlineView.getVisibility() == View.VISIBLE) {
                                    loadExamJK();
                                }
                            }
                        });
                    }

                    @Override
                    public void onLost(@NonNull android.net.Network network) {
                        runOnUiThread(() -> {
                            if (webView != null) {
                                webView.getSettings().setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);
                            }
                        });
                    }
                });
            }
        } catch (Exception ignored) {}
    }

    private String getTargetUrl() {
        // Read saved server URL or default
        return prefs.getString(KEY_SERVER_URL, DEFAULT_URL);
    }

    private void loadExamJK() {
        offlineView.setVisibility(View.GONE);
        webView.setVisibility(View.VISIBLE);
        if (isNetworkConnected()) {
            webView.getSettings().setCacheMode(WebSettings.LOAD_DEFAULT);
        } else {
            webView.getSettings().setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);
        }
        String target = getTargetUrl();
        webView.loadUrl(target);
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void setupWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);

        // Intelligent offline caching: Use network when available, fallback to cache when offline
        if (isNetworkConnected()) {
            settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        } else {
            settings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);
        }

        // Enable Android Service Worker in WebView for high-performance offline caching
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            try {
                android.webkit.ServiceWorkerController swController = android.webkit.ServiceWorkerController.getInstance();
                swController.setServiceWorkerClient(new android.webkit.ServiceWorkerClient() {
                    @Override
                    public android.webkit.WebResourceResponse shouldInterceptRequest(WebResourceRequest request) {
                        return super.shouldInterceptRequest(request);
                    }
                });
            } catch (Exception ignored) {}
        }
        // Calibrate responsive viewport and vector zoom to match Adobe Acrobat clarity
        settings.setUseWideViewPort(false);
        settings.setLoadWithOverviewMode(false);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        // Append ExamJK Android user agent identifier
        String defaultUA = settings.getUserAgentString();
        settings.setUserAgentString(defaultUA + " ExamJK-Android-App/1.0");

        // Prevent downward drag bounce / overscroll on WebView for phones, tablets & Smartboards
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);

        // Enable third-party cookies for seamless auth sessions
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(webView, true);

        // Android bridge for app control (locks pull-refresh and preserves non-overlapping status bar)
        webView.addJavascriptInterface(new Object() {
            @android.webkit.JavascriptInterface
            public void setSwipeRefreshEnabled(final boolean enabled) {
                runOnUiThread(() -> {
                    if (swipeRefresh != null) {
                        swipeRefresh.setEnabled(false); // Globally keep disabled
                    }
                });
            }

            @android.webkit.JavascriptInterface
            public void setPdfOpen(final boolean open) {
                isPdfOpen = open;
                runOnUiThread(() -> {
                    if (swipeRefresh != null) {
                        swipeRefresh.setEnabled(false);
                    }
                    enforceNonOverlappingStatusBar();
                });
            }

            @android.webkit.JavascriptInterface
            public boolean isPdfOpen() {
                return isPdfOpen;
            }

            @android.webkit.JavascriptInterface
            public void showStatusBar() {
                runOnUiThread(MainActivity.this::enforceNonOverlappingStatusBar);
            }

            @android.webkit.JavascriptInterface
            public void hideStatusBar() {
                // Keep native status bar outside WebView so icons never overlap exam header
                runOnUiThread(MainActivity.this::enforceNonOverlappingStatusBar);
            }

            @android.webkit.JavascriptInterface
            public void setStatusBarVisible(final boolean visible) {
                runOnUiThread(MainActivity.this::enforceNonOverlappingStatusBar);
            }

            @android.webkit.JavascriptInterface
            public void setStatusBarOverlay(final boolean overlay) {
                runOnUiThread(MainActivity.this::enforceNonOverlappingStatusBar);
            }

            @android.webkit.JavascriptInterface
            public void setImmersiveFullscreen(final boolean enabled) {
                runOnUiThread(MainActivity.this::enforceNonOverlappingStatusBar);
            }

            @android.webkit.JavascriptInterface
            public void setFullscreen(final boolean enabled) {
                runOnUiThread(MainActivity.this::enforceNonOverlappingStatusBar);
            }

            @android.webkit.JavascriptInterface
            public void enterFullscreen() {
                runOnUiThread(MainActivity.this::enforceNonOverlappingStatusBar);
            }

            @android.webkit.JavascriptInterface
            public void enterFullScreen() {
                runOnUiThread(MainActivity.this::enforceNonOverlappingStatusBar);
            }

            @android.webkit.JavascriptInterface
            public void enableImmersiveMode() {
                runOnUiThread(MainActivity.this::enforceNonOverlappingStatusBar);
            }

            @android.webkit.JavascriptInterface
            public void syncSystemBarInsets() {
                runOnUiThread(MainActivity.this::enforceNonOverlappingStatusBar);
            }
        }, "AndroidApp");

        // Hardware acceleration
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

        // File download support
        webView.setDownloadListener((url, userAgent, contentDisposition, mimetype, contentLength) -> {
            try {
                DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
                request.setMimeType(mimetype);
                String cookies = CookieManager.getInstance().getCookie(url);
                request.addRequestHeader("cookie", cookies);
                request.addRequestHeader("User-Agent", userAgent);
                request.setDescription("Downloading file from ExamJK...");
                String filename = URLUtil.guessFileName(url, contentDisposition, mimetype);
                request.setTitle(filename);
                request.allowScanningByMediaScanner();
                request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, filename);

                DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
                if (dm != null) {
                    dm.enqueue(request);
                    Toast.makeText(MainActivity.this, "Downloading " + filename, Toast.LENGTH_SHORT).show();
                }
            } catch (Exception e) {
                Toast.makeText(MainActivity.this, "Download error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                progressBar.setVisibility(View.VISIBLE);
                progressBar.setProgress(10);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                progressBar.setVisibility(View.GONE);
                swipeRefresh.setRefreshing(false);
                enforceNonOverlappingStatusBar();
            }

            @Override
            public void doUpdateVisitedHistory(WebView view, String url, boolean isReload) {
                super.doUpdateVisitedHistory(view, url, isReload);
                enforceNonOverlappingStatusBar();
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    // If offline, attempt to serve cached page without kicking user out
                    if (!isNetworkConnected()) {
                        view.getSettings().setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);
                        if (view.getContentHeight() > 0) {
                            progressBar.setVisibility(View.GONE);
                            swipeRefresh.setRefreshing(false);
                            return;
                        }
                    }
                    progressBar.setVisibility(View.GONE);
                    swipeRefresh.setRefreshing(false);
                    webView.setVisibility(View.GONE);
                    offlineView.setVisibility(View.VISIBLE);
                }
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String scheme = uri.getScheme();
                if (scheme != null && !scheme.equals("http") && !scheme.equals("https")) {
                    // Open WhatsApp, tel, mailto, etc. in external apps
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                        startActivity(intent);
                        return true;
                    } catch (Exception e) {
                        return false;
                    }
                }
                return false;
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                progressBar.setProgress(newProgress);
                if (newProgress >= 100) {
                    progressBar.setVisibility(View.GONE);
                }
            }

            // Grant microphone and audio capture for Japanese & Korean voice models
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        request.grant(request.getResources());
                    }
                });
            }

            // File upload handler
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback,
                                             FileChooserParams fileChooserParams) {
                if (MainActivity.this.filePathCallback != null) {
                    MainActivity.this.filePathCallback.onReceiveValue(null);
                }
                MainActivity.this.filePathCallback = filePathCallback;

                Intent intent = fileChooserParams.createIntent();
                try {
                    fileChooserLauncher.launch(intent);
                } catch (Exception e) {
                    MainActivity.this.filePathCallback = null;
                    Toast.makeText(MainActivity.this, "Cannot open file chooser", Toast.LENGTH_SHORT).show();
                    return false;
                }
                return true;
            }
        });
    }

    private void setupSwipeRefresh() {
        swipeRefresh.setColorSchemeResources(R.color.accent, R.color.primary);
        swipeRefresh.setEnabled(false); // GLOBALLY DISABLED: Prevent pull-down refresh on all devices & smartboards
        swipeRefresh.setOverScrollMode(View.OVER_SCROLL_NEVER);
        swipeRefresh.setOnRefreshListener(() -> swipeRefresh.setRefreshing(false));
        swipeRefresh.setOnChildScrollUpCallback((parent, child) -> true);
    }

    private void setupBackNavigation() {
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                webView.evaluateJavascript(
                    "(function() { if (typeof window !== 'undefined' && typeof window.__handleAppBack === 'function') { return window.__handleAppBack(); } return false; })()",
                    value -> {
                        if ("true".equalsIgnoreCase(value)) {
                            // Handled internally by web app (e.g. closed full-screen PDF, modal, or drawer)
                            return;
                        }
                        if (webView.canGoBack()) {
                            webView.goBack();
                        } else {
                            if (System.currentTimeMillis() - backPressedTime < 2000) {
                                finish();
                            } else {
                                backPressedTime = System.currentTimeMillis();
                                Toast.makeText(MainActivity.this, getString(R.string.exit_prompt), Toast.LENGTH_SHORT).show();
                            }
                        }
                    }
                );
            }
        });
    }

    // Secret long-click dialog to switch server URL (helpful for testing on mobile device vs emulator)
    public void showServerUrlDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("ExamJK Server Configuration");
        final EditText input = new EditText(this);
        input.setText(getTargetUrl());
        builder.setView(input);

        builder.setPositiveButton("Save & Reload", (dialog, which) -> {
            String newUrl = input.getText().toString().trim();
            if (!newUrl.isEmpty()) {
                prefs.edit().putString(KEY_SERVER_URL, newUrl).apply();
                loadExamJK();
            }
        });
        builder.setNegativeButton("Cancel", (dialog, which) -> dialog.cancel());
        builder.show();
    }
}
