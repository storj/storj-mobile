import React, { Component } from 'react';
import {
  BackHandler,
  Platform,
  View,
  DeviceEventEmitter
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { addNavigationHelpers } from 'react-navigation';
import StackNavigator from '../navigators/StackNavigator';
import { NavigationActions } from 'react-navigation';
import eventNames from '../utils/constants/eventNames';
import {
    bucketsContainerActions,
	mainContainerActions
} from '../reducers/mainContainer/mainReducerActions';
import {
	mainContainerFileActions,
	filesListContainerFileActions
} from '../reducers/mainContainer/Files/filesReducerActions'
import { authNavigationActions } from '../reducers/navigation/navigationActions';
import ListItemModel from '../models/ListItemModel';
import BucketModel from '../models/BucketModel';
import FileModel from '../models/FileModel';
import WarningComponent from '../components/WarningComponent';


import SyncModule from '../utils/SyncModule';
import ServiceModule from '../utils/ServiceModule';

/**
 * Component that contains main navigator
 */
class Apps extends Component {

	constructor(props) {
        super(props);

		this.onHardwareBackPress = this.onHardwareBackPress.bind(this);
		this.getbucketsListener = null;
		this.bucketCreatedListener = null;
		this.bucketDeletedListener = null;
		this.fileDeletedListener = null;
		this.getFilesListener = null;
    }

	async componentWillMount() {
		await ServiceModule.bindService();
		await ServiceModule.bindUploadService();
		ServiceModule.scheduleSync("elvy.baila@arockee.com");

		this.getbucketsListener = DeviceEventEmitter.addListener(eventNames.EVENT_BUCKETS_UPDATED, this.onBucketsReceived.bind(this));       
		this.bucketCreatedListener = DeviceEventEmitter.addListener(eventNames.EVENT_BUCKET_CREATED, this.onBucketCreated.bind(this));       
		this.bucketDeletedListener = DeviceEventEmitter.addListener(eventNames.EVENT_BUCKET_DELETED, this.onBucketDeleted.bind(this));       
		this.fileDeletedListener = DeviceEventEmitter.addListener(eventNames.EVENT_FILE_DELETED, this.onFileDeleted.bind(this));       
		this.getFilesListener = DeviceEventEmitter.addListener(eventNames.EVENT_FILES_UPDATED, this.onFilesReceived.bind(this));		
	}

	componentDidMount() {
		if(Platform.OS === 'android') {
			BackHandler.addEventListener("hardwareBackPress", this.onHardwareBackPress);
		}
	}

	componentWillUnmount() {
		if(Platform.OS === 'android') {
			BackHandler.removeEventListener("hardwareBackPress", this.onHardwareBackPress);
		}
		
		this.getbucketsListener.remove();
		this.bucketCreatedListener.remove();
		this.bucketDeletedListener.remove();
		this.fileDeletedListener.remove();
		this.getFilesListener.remove();
	}

	onHardwareBackPress() {
		if (this.props.nav.index === 0) {
			return true;
		}

		//this.props.dispatch(NavigationActions.back());
		return true;
	}

	async onFilesReceived() {
        this.props.setLoading();
        let filesResponse = await SyncModule.listFiles(this.props.openedBucketId);		

        if(filesResponse.isSuccess) {
            let files = JSON.parse(filesResponse.result).map((file) => {
                return new ListItemModel(new FileModel(file));
            });                    
            this.props.listFiles(this.props.openedBucketId, files);
        }

        this.props.unsetLoading();
    }


	async onBucketsReceived() {
        this.props.setLoading();
		let bucketsResponse = await SyncModule.listBuckets();

        if(bucketsResponse.isSuccess) {
            let buckets = JSON.parse(bucketsResponse.result).map((file) => {
                return new ListItemModel(new BucketModel(file));
            });                    

            this.props.getBuckets(buckets);
        }
		
        this.props.unsetLoading();
    }

	onBucketCreated(response) {
		if(response.isSuccess) {
			this.props.createBucket(new ListItemModel(new BucketModel(JSON.parse(response.result))));	
		}	
	}

	onBucketDeleted(response) {				
		if(response.isSuccess) {
			this.props.deleteBucket(response.result);
		}
	}
	
	onFileDeleted(response) {		
		if(response.isSuccess) {
			let result = JSON.parse(response.result);
			this.props.deleteFile(result.bucketId, result.fileId);
		}
	}

	chooseWarning() {
		if(!this.props.isEmailConfirmed) {
			return(
				<WarningComponent
					message = { 'Please confirm your email' }
					statusBarColor = '#EB5757' />
			)
		} else if(!this.props.isAccountExist) {
			return(
				<WarningComponent
					message = { 'This acoound doesn`t exist' }
					statusBarColor = '#EB5757' />
			)
		} else {
			return(
				<WarningComponent />
			)
		}
	}

	render() {
		return (
			<View style = { { flex: 1 } }>
				<StackNavigator 
					screenProps = {{
						redirectToLoginScreen: this.props.redirectToLoginScreen,
						redirectToMainScreen: this.props.redirectToMainScreen,
						redirectToMnemonicConfirmationScreen: this.props.redirectToMnemonicConfirmationScreen,
						redirectToMnemonicConfirmedScreen: this.props.redirectToMnemonicConfirmedScreen,
						redirectToMnemonicGenerationScreen: this.props.redirectToMnemonicGenerationScreen,
						redirectToMnemonicInfoScreen: this.props.redirectToMnemonicInfoScreen,
						redirectToMnemonicNotConfirmedScreen: this.props.redirectToMnemonicNotConfirmedScreen,
						redirectToRegisterSuccessScreen: this.props.redirectToRegisterSuccessScreen,
						redirectToRegisterScreen: this.props.redirectToRegisterScreen,
						navigateBack : this.props.navigateBack
					}}
					navigation = { addNavigationHelpers({
						dispatch: this.props.dispatch,
						state: this.props.nav					
					})}
				/>
				{
					this.chooseWarning()
				}	
			</View>
		);
	};
}

/**
 * connecting navigation reducer to component props
 */
function mapStateToProps(state) {
    return {
		openedBucketId: state.mainReducer.openedBucketId,
		nav: state.navReducer,
		isEmailConfirmed: state.authReducer.user.isEmailConfirmed,
		isAccountExist: state.authReducer.user.isAccountExist
    };
}
 
function mapDispatchToProps(dispatch) {
	return bindActionCreators( {
		...bucketsContainerActions, 
		...mainContainerActions,
		...mainContainerFileActions,
		...filesListContainerFileActions,
		...authNavigationActions }, dispatch);
}

/**
 * Creating navigator container
 */
export const AppWithNavigationState = connect(mapStateToProps, mapDispatchToProps)(Apps);
 