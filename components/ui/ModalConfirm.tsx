import { Button, Modal, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

interface ModalConfirmInterface {
    showConfirmModal: boolean,
    closeConfirmModal: () => void,
    deleteTicket: () => void
}

export default function ModalConfirm({showConfirmModal, closeConfirmModal, deleteTicket} : ModalConfirmInterface) {

    const styles = StyleSheet.create({
        modalContainer: {
            flex: 1
        },
        modalContentContainer: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
        },
    })

    return (
        <GestureHandlerRootView>
            <Modal
                onRequestClose={closeConfirmModal}
                style={styles.modalContainer}
                visible={showConfirmModal}
                statusBarTranslucent={true}
                transparent={true}
                animationType="fade">
                    <View style={styles.modalContentContainer}>
                        <Button onPress={deleteTicket} title="save"/>
                        <Button onPress={closeConfirmModal} title="close"/>
                    </View>
            </Modal>
        </GestureHandlerRootView>
    )
}