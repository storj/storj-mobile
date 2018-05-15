import { Alert } from 'react-native';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { redirectToMainScreen } from '../reducers/navigation/navigationActions';
import { imageViewerActions } from '../reducers/mainContainer/Files/filesReducerActions';
import ServiceModule from '../utils/ServiceModule';
import SyncModule from "../utils/SyncModule";
import ShareModule from "../utils/ShareModule";
import TabBarActionModelFactory from '../models/TabBarActionModel';
import ImageViewComponent from "../components/ImageViewerComponent";
import ListItemModel from '../models/ListItemModel';
import FileModel from "../models/FileModel";
import BaseFileViewerContainer from '../containers/BaseFileViewerContainer';

class ImageViewerContainer extends BaseFileViewerContainer {
    constructor(props) {
        super(props);

        this.state = {
            showActionBar: false
        };

        this.toggleActionBar = this.toggleActionBar.bind(this);
        this.navigateBack = this.navigateBack.bind(this);
    }

    toggleActionBar() {
        this.setState({
            showActionBar: !this.state.showActionBar
        });
    }

    //ACTIONS
    async setFavourite() {
        let updateStarredResponse = await SyncModule.updateFileStarred(this.fileId, !this.isStarred);
        
        if(updateStarredResponse.isSuccess) {
            this.props.updateFavouriteFiles([new ListItemModel(new FileModel({ fileId: this.fileId }))]);
        }    
    }

    tryDeleteFile() {
        Alert.alert(
            'Delete permanently?',
            'Are you sure to delete selected files permanently?',
            [
                { text: 'Cancel', onPress: () => { }, style: 'cancel' },
                { text: 'Delete', onPress: () => this.deleteImage() }
            ],
            { cancelable: false }
        );
    }

    async deleteImage() {
        let deleteResponse = await ServiceModule.deleteFile(this.bucketId, this.fileId);
        this.props.redirectToMainScreen();
    }

    tryCopySelectedFile() {
        this._imageViewComponent.showSelectBuckets(this.copySelectedFile.bind(this));
    }

    copySelectedFile(params) {
        let bucketId = params.bucketId;

        if(bucketId) {
            ServiceModule.uploadFile(bucketId, this.props.localPath);
        }

        this._imageViewComponent.showSelectBuckets();
    }

    getActionBarActions() {
        return [
            TabBarActionModelFactory.createNewAction(
                () => { this.setFavourite(); }, 
                'Action 1', 
                this.props.isStarred ?
                    require('../images/ActionBar/UnsetFavourite.png') :
                    require('../images/ActionBar/FavoritesIcon.png')
            ),
            TabBarActionModelFactory.createNewAction(() => { this.tryCopySelectedFile()}, 'Action 3', require('../images/ActionBar/CopyBucketIcon.png')),
            TabBarActionModelFactory.createNewAction(() => { this.tryDeleteFile(); }, 'Action 4', require('../images/ActionBar/TrashBucketIcon.png'))
        ];
    }
    //ACTIONS END

    async share(url) {
        if(!this.props.isDownloaded) {
            return;
        }

        await ShareModule.shareFile(url);
    }

    render() {
        return(
            <ImageViewComponent
                onShare = { this.share.bind(this) }
                isLoading = { this.props.isLoading }
                isDownloaded = { this.props.isDownloaded }
                progress = { this.props.progress }
                ref = { component => this._imageViewComponent = component }
                onBackPress = { this.navigateBack }
                imageUri = { { uri: "file://" + this.props.localPath } }
                showActionBar = { this.state.showActionBar }
                onOptionsPress = { this.toggleActionBar }
                isGridViewShown = { this.props.isGridViewShown }
                buckets = { this.props.buckets }
                actionBarActions = { this.getActionBarActions() } />
        );   
    }
}

function mapStateToProps(state) {
    let index = state.navReducer.index;
    let fileId = state.navReducer.routes[index].routeName === "ImageViewerScreen" ? state.navReducer.routes[index].params.fileId : null;
    let file = state.filesReducer.fileListModels.find((item) => item.getId() === fileId);
    let isStarred = false;
    let isLoading = false;
    let isDownloaded = false;
    let progress = 0;
    let localPath = null;
    let fileRef = 0;

    if(file) {
        isStarred = file.getStarred();
        isLoading = file.isLoading;
        isDownloaded = file.entity.isDownloaded;
        progress = file.progress;
        localPath = file.entity.localPath;
        fileRef = file.fileRef ? file.fileRef: fileRef;
    }
        
    return {
        isStarred,
        isLoading,
        isDownloaded,
        progress,
        localPath,
        fileRef,
        isGridViewShown: state.mainReducer.isGridViewShown,
        buckets: state.bucketReducer.buckets
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ redirectToMainScreen, ...imageViewerActions }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ImageViewerContainer);