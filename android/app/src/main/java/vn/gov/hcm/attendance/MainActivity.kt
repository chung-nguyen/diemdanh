package vn.gov.hcm.attendance

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.ImageButton
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.budiyev.android.codescanner.AutoFocusMode
import com.budiyev.android.codescanner.CodeScanner
import com.budiyev.android.codescanner.CodeScannerView
import com.budiyev.android.codescanner.DecodeCallback
import com.budiyev.android.codescanner.ErrorCallback
import com.budiyev.android.codescanner.ScanMode
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors


class MainActivity : ComponentActivity() {
    private val executorService: ExecutorService = Executors.newSingleThreadExecutor()

    private lateinit var codeScanner: CodeScanner
    private lateinit var protocol: String
    private lateinit var ipAddress: String
    private lateinit var httpPort: String
    private lateinit var httpPath: String

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        loadSettings()
        setContentView(R.layout.main_activity)

        val btnSettings = findViewById<ImageButton>(R.id.button_settings)

        btnSettings.setOnClickListener {
            val intent = Intent(this, SettingsActivity::class.java)
            startActivity(intent)
        }

        val scannerView = findViewById<CodeScannerView>(R.id.scanner_view)

        codeScanner = CodeScanner(this, scannerView)

        // Parameters (default values)
        codeScanner.camera = CodeScanner.CAMERA_FRONT // or CAMERA_FRONT or specific camera id
        codeScanner.formats = CodeScanner.ALL_FORMATS // list of type BarcodeFormat,
        // ex. listOf(BarcodeFormat.QR_CODE)
        codeScanner.autoFocusMode = AutoFocusMode.SAFE // or CONTINUOUS
        codeScanner.scanMode = ScanMode.SINGLE // or CONTINUOUS or PREVIEW
        codeScanner.isAutoFocusEnabled = true // Whether to enable auto focus or not
        codeScanner.isFlashEnabled = false // Whether to enable flash or not

        // Callbacks
        codeScanner.decodeCallback = DecodeCallback {
            executorService.execute()
            {
                val code = it.text.substringAfterLast("/")
                val cleanedPath = httpPath.removePrefix("/").removeSuffix("/")
                val portNum = httpPort.toIntOrNull();
                if (portNum == 80) {
                    sendGetRequest("${protocol}://${ipAddress}/${cleanedPath}/${code}")
                } else {
                    sendGetRequest("${protocol}://${ipAddress}:${httpPort}/${cleanedPath}/${code}")
                }
                runOnUiThread {
                    Toast.makeText(this, code, Toast.LENGTH_LONG).show()

                    lifecycleScope.launch {
                        delay(3000)
                        checkCameraPermissionAndStart()
                    }
                }
            }
        }
        codeScanner.errorCallback = ErrorCallback { // or ErrorCallback.SUPPRESS
            runOnUiThread {
                Toast.makeText(this, "Camera initialization error: ${it.message}",
                    Toast.LENGTH_LONG).show()
            }
        }

        checkCameraPermissionAndStart()
        scannerView.setOnClickListener {
            checkCameraPermissionAndStart()
        }
    }

    override fun onResume() {
        super.onResume()
        loadSettings()
        codeScanner.startPreview()
    }

    override fun onPause() {
        codeScanner.releaseResources()
        super.onPause()
    }

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            codeScanner.startPreview()
        } else {
            Toast.makeText(this, "Camera permission denied", Toast.LENGTH_SHORT).show()
        }
    }

    fun checkCameraPermissionAndStart() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
            == PackageManager.PERMISSION_GRANTED) {
            codeScanner.startPreview()
        } else {
            requestPermissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    fun sendGetRequest(urlString: String): String {
        var connection: HttpURLConnection? = null
        var reader: BufferedReader? = null
        try {
            val url = URL(urlString)
            connection = url.openConnection() as HttpURLConnection?
            connection!!.setRequestMethod("GET")

            val responseCode = connection.getResponseCode()
            if (responseCode == HttpURLConnection.HTTP_OK) {
                reader = BufferedReader(InputStreamReader(connection.getInputStream()))
                val response = StringBuilder()
                var line: String?
                while ((reader.readLine().also { line = it }) != null) {
                    response.append(line)
                }
                return response.toString()
            } else {
                return "Error: " + responseCode
            }
        } catch (e: Exception) {
            e.printStackTrace()
            return "Exception: " + e.message
        } finally {
            if (reader != null) {
                try {
                    reader.close()
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
            if (connection != null) {
                connection.disconnect()
            }
        }
    }

    private fun loadSettings() {
        val prefs = getSharedPreferences("app_settings", MODE_PRIVATE)
        protocol = prefs.getString("protocol", "http") ?: "http"
        ipAddress = prefs.getString("ip_address", "127.0.0.1") ?: "127.0.0.1"
        httpPort = prefs.getString("http_port", "80") ?: ""
        httpPath = prefs.getString("http_path", "/qr") ?: "/qr"

        val cleanedPath = httpPath.removePrefix("/").removeSuffix("/")
        Toast.makeText(this, "${protocol}://${ipAddress}:${httpPort}/${cleanedPath}/CODE",Toast.LENGTH_LONG).show()
    }
}
