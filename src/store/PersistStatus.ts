
import safeParse from '@/utils/safeParse';
import {useEffect, useState} from 'react';
import getOrCreateMMKV from '@/store/getOrCreateMMKV'

const PersistConfig = {
    PersistStatus: 'appPersistStatus',
};

interface IPersistConfig {
    'music.musicItem': IMusic.IMusicItem;//当前播放
    'music.progress': number;
    'music.repeatMode': string;
    'music.playList': IMusic.IMusicItem[];
    'music.rate': number;
    'music.quality': IMusic.IQualityKey;
    'app.skipVersion': string;
    'app.pluginUpdateTime': number;
    'lyric.showTranslation': boolean;
    'lyric.detailFontSize': number;
    'app.logo': 'Default' | 'Logo1';
}

function set<K extends keyof IPersistConfig>(
    key: K,
    value: IPersistConfig[K] | undefined,
) {
    const store = getOrCreateMMKV(PersistConfig.PersistStatus);
    if (value === undefined) {
        store.delete(key);
    } else {
        store.set(key, JSON.stringify(value));
    }
}

function get<K extends keyof IPersistConfig>(key: K): IPersistConfig[K] | null {
    const store = getOrCreateMMKV(PersistConfig.PersistStatus);
    const raw = store.getString(key);
    if (raw) {
        return safeParse(raw) as IPersistConfig[K];
    }
    return null;
}

function useValue<K extends keyof IPersistConfig>(
    key: K,
    defaultValue?: IPersistConfig[K],
): IPersistConfig[K] | null {
    const [state, setState] = useState<IPersistConfig[K] | null>(
        get(key) ?? defaultValue ?? null,
    );

    useEffect(() => {
        const store = getOrCreateMMKV(PersistConfig.PersistStatus);
        const sub = store.addOnValueChangedListener(changedKey => {
            if (key === changedKey) {
                setState(get(key));
            }
        });

        return () => {
            sub.remove();
        };
    }, [key]);

    return state;
}

const PersistStatus = {
    get,
    set,
    useValue,
};

export default PersistStatus;
