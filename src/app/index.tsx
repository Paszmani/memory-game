import {View, Text, Button, StyleSheet} from 'react-native';
import {useRouter} from 'expo-router';

export default function Index() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>HOLy MOLy</Text>
            <Text style={styles.text}>AAAAAAAAA</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#fff',
    },
});