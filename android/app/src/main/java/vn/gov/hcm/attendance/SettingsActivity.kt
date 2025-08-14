package vn.gov.hcm.attendance

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Spinner
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.content.edit

class SettingsActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_settings)

        val spinnerProtocol: Spinner = findViewById(R.id.spinner_protocol)
        val inputIp: EditText = findViewById(R.id.input_ip_address)
        val inputPort: EditText = findViewById(R.id.input_http_port)
        val inputPath: EditText = findViewById(R.id.input_http_path)
        val btnSave: Button = findViewById(R.id.button_save)

        // Load saved values when opening the app
        val prefs = getSharedPreferences("app_settings", MODE_PRIVATE)
        val savedProtocol = prefs.getString("protocol", "http")
        val savedIp = prefs.getString("ip_address", "127.0.0.1")
        val savedPort = prefs.getString("http_port", "5005")
        val savedPath = prefs.getString("http_path", "/dd")

        // Restore UI values
        val protocolArray = resources.getStringArray(R.array.protocols)
        val index = protocolArray.indexOf(savedProtocol)
        if (index >= 0) spinnerProtocol.setSelection(index)

        inputIp.setText(savedIp)
        inputPort.setText(savedPort)
        inputPath.setText(savedPath)

        // Save on button click
        btnSave.setOnClickListener {
            prefs.edit {
                putString("protocol", spinnerProtocol.selectedItem.toString())
                putString("ip_address", inputIp.text.toString())
                putString("http_port", inputPort.text.toString())
                putString("http_path", inputPath.text.toString())
            }

            Toast.makeText(this, "Đã lưu lại!", Toast.LENGTH_SHORT).show()

            finish()
        }
    }
}