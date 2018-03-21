package storjlib.Models;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

import storjlib.dataProvider.contracts.SettingsContract;

/**
 * Created by Yaroslav-Note on 3/19/2018.
 */

public class SettingsModel {
    @Expose
    @SerializedName(SettingsContract._SETTINGS_ID)
    private String _id;
    @Expose
    @SerializedName(SettingsContract._SYNC_SETTINGS)
    private int _syncSettings;
    @Expose
    @SerializedName(SettingsContract._LAST_SYNC)
    private String _lastSync;

    public SettingsModel() {

    }

    public SettingsModel(String settingsId) {
        this(settingsId, 0,null);
    }

    public SettingsModel(String settingsId, int syncSettings, String lastSync) {
        _id = settingsId;
        _syncSettings = syncSettings;
        _lastSync = lastSync;
    }

    public String getId() { return _id; }
    public int getSyncSettings() { return _syncSettings; }
    public String lastSync() { return _lastSync; }
}
