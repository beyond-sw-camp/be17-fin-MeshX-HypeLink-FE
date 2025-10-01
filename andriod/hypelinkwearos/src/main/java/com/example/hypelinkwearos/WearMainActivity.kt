package com.example.hypelinkwearos

import android.Manifest
import android.app.Activity
import android.content.pm.PackageManager
import android.location.Location
import android.nfc.NdefMessage
import android.nfc.NdefRecord
import android.nfc.NfcAdapter
import android.nfc.NfcAdapter.ReaderCallback
import android.nfc.Tag
import android.nfc.tech.Ndef
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.example.hypelinkwearos.databinding.ActivityWearMainBinding
import com.example.hypelinkwearos.ws.StompManager
import com.google.android.gms.location.LocationServices
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.text.Charsets.UTF_8

class WearMainActivity : AppCompatActivity(), ReaderCallback {

    private lateinit var b: ActivityWearMainBinding
    private var nfcAdapter: NfcAdapter? = null
    private val fused by lazy { LocationServices.getFusedLocationProviderClient(this) }

    private var connected = false
    private var locJob: Job? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        b = ActivityWearMainBinding.inflate(layoutInflater)
        setContentView(b.root)

        nfcAdapter = NfcAdapter.getDefaultAdapter(this)

        b.btnConnect.setOnClickListener { connectFromNfcUrl() }
        b.btnStart.setOnClickListener { startSendingLocation() }
        b.btnComplete.setOnClickListener { sendCompleteOnce() }
        b.btnDisconnect.setOnClickListener { disconnect() }
    }

    override fun onResume() {
        super.onResume()
        enableNfcReaderMode(true)
    }

    override fun onPause() {
        super.onPause()
        enableNfcReaderMode(false)
    }

    // ===== NFC =====
    private fun enableNfcReaderMode(enable: Boolean) {
        val act = this as Activity
        if (nfcAdapter == null) return
        if (enable) {
            nfcAdapter?.enableReaderMode(
                act,
                this,
                NfcAdapter.FLAG_READER_NFC_A or
                        NfcAdapter.FLAG_READER_NFC_B or
                        NfcAdapter.FLAG_READER_NFC_F or
                        NfcAdapter.FLAG_READER_NFC_V or
                        NfcAdapter.FLAG_READER_NFC_BARCODE,
                null
            )
        } else {
            nfcAdapter?.disableReaderMode(act)
        }
    }

    override fun onTagDiscovered(tag: Tag?) {
        tag ?: return
        val ndef = Ndef.get(tag) ?: return
        try {
            ndef.connect()
            val msg: NdefMessage = ndef.cachedNdefMessage ?: return
            val url = extractUrlFromNdef(msg) ?: return
            NFCState.lastUrl = url
            runOnUiThread { b.tvStatus.text = "NFC URL: $url" }
        } catch (t: Throwable) {
            Log.e("NFC", "read fail", t)
        } finally {
            try { ndef.close() } catch (_: Exception) {}
        }
    }

    private fun extractUrlFromNdef(msg: NdefMessage): String? {
        for (rec in msg.records) {
            if (rec.tnf == NdefRecord.TNF_WELL_KNOWN && rec.type.contentEquals(NdefRecord.RTD_URI)) {
                return decodeRtdUri(rec)
            }
            if (rec.tnf == NdefRecord.TNF_WELL_KNOWN && rec.type.contentEquals(NdefRecord.RTD_TEXT)) {
                val payload = rec.payload
                val langLen = payload[0].toInt() and 0x3F
                return String(payload, 1 + langLen, payload.size - 1 - langLen, UTF_8)
            }
        }
        return null
    }

    private fun decodeRtdUri(rec: NdefRecord): String? {
        val prefixMap = arrayOf(
            "", "http://www.", "https://www.", "http://", "https://",
            "tel:", "mailto:", "ftp://anonymous:anonymous@", "ftp://ftp.", "ftps://",
            "sftp://", "smb://", "nfs://", "ftp://", "dav://", "news:", "telnet://",
            "imap:", "rtsp://", "urn:", "pop:", "sip:", "sips:", "tftp:", "btspp://",
            "btl2cap://", "btgoep://", "tcpobex://", "irdaobex://", "file://",
            "urn:epc:id:", "urn:epc:tag:", "urn:epc:pat:", "urn:epc:raw:", "urn:epc:",
            "urn:nfc:"
        )
        val p = rec.payload
        if (p.isEmpty()) return null
        val prefixIdx = p[0].toInt() and 0xFF
        val prefix = prefixMap.getOrElse(prefixIdx) { "" }
        val rest = String(p, 1, p.size - 1, UTF_8)
        return prefix + rest
    }

    // ===== 연결/버튼 =====
    private fun connectFromNfcUrl() {
        val url = NFCState.lastUrl
        if (url.isNullOrBlank()) {
            toast("NFC에서 URL을 먼저 스캔하세요")
            return
        }
        b.tvStatus.text = "연결 중..."
        StompManager.connect(
            url = url,
            onConnected = {
                connected = true
                runOnUiThread {
                    b.tvStatus.text = "STOMP 연결 성공: $url"
                    b.btnStart.isEnabled = true
                    b.btnComplete.isEnabled = true
                    b.btnDisconnect.isEnabled = true
                }
            },
            onError = { msg ->
                runOnUiThread { b.tvStatus.text = "연결 실패: $msg" }
            }
        )
    }

    private fun startSendingLocation() {
        if (!connected) { toast("먼저 연결하세요"); return }
        if (!hasLocationPerms()) {
            requestLocationPerms()
            return
        }
        if (locJob?.isActive == true) {
            toast("이미 전송 중")
            return
        }
        b.tvStatus.text = "위치 전송 시작"
        locJob = lifecycleScope.launch {
            while (true) {
                fused.lastLocation.addOnSuccessListener { loc: Location? ->
                    if (loc != null) {
                        StompManager.sendLocation(loc.latitude, loc.longitude)
                        b.tvStatus.text = "위치 전송: %.5f, %.5f".format(loc.latitude, loc.longitude)
                    } else {
                        b.tvStatus.text = "현재 위치 없음"
                    }
                }
                delay(5000)
            }
        }
    }

    private fun sendCompleteOnce() {
        if (!connected) { toast("먼저 연결하세요"); return }
        if (!hasLocationPerms()) {
            requestLocationPerms()
            return
        }
        fused.lastLocation.addOnSuccessListener { loc: Location? ->
            if (loc != null) {
                StompManager.sendDeliveryComplete(loc.latitude, loc.longitude, "DELIV_WEAR_0001")
                b.tvStatus.text = "배송 완료 전송"
            } else {
                b.tvStatus.text = "현재 위치 없음"
            }
        }
    }

    private fun disconnect() {
        locJob?.cancel()
        StompManager.disconnect()
        connected = false
        b.btnStart.isEnabled = false
        b.btnComplete.isEnabled = false
        b.btnDisconnect.isEnabled = false
        b.tvStatus.text = "연결 종료"
    }

    // ===== 권한 =====
    private fun hasLocationPerms(): Boolean {
        val f = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
        val c = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
        return f || c
    }

    private fun requestLocationPerms() {
        requestPermissions(
            arrayOf(
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
            ),
            1001
        )
    }

    private fun toast(msg: String) =
        Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()
}

private object NFCState {
    var lastUrl: String? = null
}
