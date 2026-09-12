import { File as ExpoFile } from 'expo-file-system';

import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import * as ImagePicker from 'expo-image-picker';

import PrimaryButton from '../components/PrimaryButton';
import ScreenHeader from '../components/ScreenHeader';

import { RootStackParamList } from '../types/navigation';

import { COLORS } from '../theme/colors';

import {
  FONT_SIZE,
  FONT_WEIGHT,
} from '../theme/fonts';

import { RADIUS } from '../theme/dimensions';

import { SPACING } from '../theme/spacing';

import { API_BASE_URL } from '../constants/api';

import {
  getCurrentUserId,
} from '../utils/session';

import { useLanguage } from '../i18n';


// ============================================================
// TYPES
// ============================================================

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Documents'
>;

type DocumentType =
  | 'drivingLicense'
  | 'aadhaar'
  | 'pan'
  | 'rc'
  | 'insurance'
  | 'pollution';

interface DocumentItem {
  id: DocumentType;
  icon: string;
}

interface UploadedDocument {
  id: number;
  user_id: number;
  document_type: DocumentType;
  document_uri: string;
  status: string;
}

interface DocumentsResponse {
  success?: boolean;
  message?: string;
  documents?: UploadedDocument[];
}

interface UploadResponse {
  success?: boolean;
  message?: string;
  document?: UploadedDocument;
}


// ============================================================
// DOCUMENT LIST
// ============================================================

const DOCUMENTS: DocumentItem[] = [
  {
    id: 'drivingLicense',
    icon: '🚘',
  },

  {
    id: 'aadhaar',
    icon: '🪪',
  },

  {
    id: 'pan',
    icon: '💳',
  },

  {
    id: 'rc',
    icon: '📋',
  },

  {
    id: 'insurance',
    icon: '🛡️',
  },

  {
    id: 'pollution',
    icon: '📄',
  },
];


// ============================================================
// EMPTY DOCUMENTS
// ============================================================

const EMPTY_DOCUMENTS: Record<
  DocumentType,
  string | null
> = {
  drivingLicense: null,
  aadhaar: null,
  pan: null,
  rc: null,
  insurance: null,
  pollution: null,
};


// ============================================================
// ALLOWED IMAGE TYPES
// ============================================================

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];


// ============================================================
// SCREEN
// ============================================================

export default function DocumentsScreen({
  navigation,
}: Props) {

  // ==========================================================
  // LANGUAGE
  // ==========================================================

  const {
    translations: t,
  } = useLanguage();


  // ==========================================================
  // STATE
  // ==========================================================

  const [
    documents,
    setDocuments,
  ] = useState<
    Record<DocumentType, string | null>
  >({
    ...EMPTY_DOCUMENTS,
  });


  const [
    uploading,
    setUploading,
  ] = useState<DocumentType | null>(
    null,
  );


  const [
    loadingDocuments,
    setLoadingDocuments,
  ] = useState(true);


  // ==========================================================
  // BACK BUTTON
  // ==========================================================

  const handleBack = () => {

    console.log(
      '⬅️ [Documents] Back pressed',
    );


    if (
      navigation.canGoBack()
    ) {

      console.log(
        '↩️ Going back to previous screen',
      );

      navigation.goBack();

      return;
    }


    console.log(
      '⚠️ No previous screen available',
    );


    console.log(
      '➡️ Falling back to Permissions',
    );


    navigation.replace(
      'Permissions',
    );
  };


  // ==========================================================
  // LOAD DOCUMENTS
  // ==========================================================

  const loadDocuments =
    useCallback(async () => {

      const currentUserId =
        await getCurrentUserId();


      console.log('');
      console.log(
        '========================================',
      );

      console.log(
        '📄 [Documents] Loading documents',
      );

      console.log(
        '👤 User ID:',
        currentUserId,
      );

      console.log(
        '========================================',
      );


      // ------------------------------------------------------
      // USER CHECK
      // ------------------------------------------------------

      if (!currentUserId) {

        console.log(
          '❌ No current user ID',
        );

        setLoadingDocuments(
          false,
        );


        Alert.alert(
          t.documents.loadErrorTitle,

          t.documents.tryAgain,

          [
            {
              text:
                t.documents.continue,

              onPress: () => {

                navigation.replace(
                  'Login',
                );

              },
            },
          ],
        );

        return;
      }


      // ------------------------------------------------------
      // API URL
      // ------------------------------------------------------

      const url =
        `${API_BASE_URL}/documents/${currentUserId}`;


      console.log(
        '🌐 GET URL:',
        url,
      );


      try {

        // ----------------------------------------------------
        // REQUEST
        // ----------------------------------------------------

        const response =
          await fetch(url);


        console.log(
          '📡 GET status:',
          response.status,
        );


        // ----------------------------------------------------
        // RESPONSE
        // ----------------------------------------------------

        const responseText =
          await response.text();


        console.log(
          '📦 GET raw response:',
          responseText,
        );


        // ----------------------------------------------------
        // PARSE JSON
        // ----------------------------------------------------

        let data: DocumentsResponse;


        try {

          data =
            JSON.parse(
              responseText,
            );

        } catch {

          throw new Error(
            t.documents.invalidResponse,
          );
        }


        // ----------------------------------------------------
        // CHECK RESPONSE
        // ----------------------------------------------------

        if (
          !response.ok ||
          !data.success
        ) {

          throw new Error(
            data.message ||
            t.documents.loadFailed,
          );
        }


        // ----------------------------------------------------
        // BUILD STATE
        // ----------------------------------------------------

        const loadedDocuments:
          Record<
            DocumentType,
            string | null
          > = {
            ...EMPTY_DOCUMENTS,
          };


        if (
          Array.isArray(
            data.documents,
          )
        ) {

          data.documents.forEach(
            (document) => {

              const type =
                document.document_type;


              if (
                document.document_uri &&
                (
                  document.status ===
                    'uploaded' ||
                  document.status ===
                    'verified'
                )
              ) {

                if (
                  Object.prototype.hasOwnProperty.call(
                    EMPTY_DOCUMENTS,
                    type,
                  )
                ) {

                  loadedDocuments[
                    type
                  ] =
                    document.document_uri;

                }

              }

            },
          );

        }


        console.log(
          '✅ Loaded documents:',
          loadedDocuments,
        );


        setDocuments(
          loadedDocuments,
        );

      } catch (error) {

        console.error(
          '❌ Load documents error:',
          error,
        );


        Alert.alert(
          t.documents.loadErrorTitle,

          error instanceof Error
            ? error.message
            : t.documents.tryAgain,
        );

      } finally {

        setLoadingDocuments(
          false,
        );


        console.log(
          '🏁 Document loading finished',
        );

      }

    }, [
      navigation,
      t,
    ]);


  // ==========================================================
  // LOAD WHEN SCREEN OPENS
  // ==========================================================

  useEffect(() => {

    console.log(
      '📄 [Documents] Screen mounted',
    );


    loadDocuments();

  }, [
    loadDocuments,
  ]);


  // ==========================================================
  // PICK + UPLOAD DOCUMENT
  // ==========================================================

  const pickDocument = async (
    type: DocumentType,
  ) => {

    const userId =
      await getCurrentUserId();


    console.log('');
    console.log(
      '========================================',
    );

    console.log(
      '🔥 [Documents] Upload clicked:',
      type,
    );

    console.log(
      '👤 User ID:',
      userId,
    );

    console.log(
      '========================================',
    );


    // --------------------------------------------------------
    // USER CHECK
    // --------------------------------------------------------

    if (!userId) {

      Alert.alert(
        t.documents.loadErrorTitle,
        t.documents.tryAgain,
      );

      return;
    }


    try {

      setUploading(
        type,
      );


      // ======================================================
      // IMAGE PICKER
      // ======================================================

      console.log(
        '📸 Opening image picker...',
      );


      const result =
        await ImagePicker.launchImageLibraryAsync({

          mediaTypes:
            ImagePicker
              .MediaTypeOptions
              .Images,

          allowsEditing:
            true,

          quality:
            0.8,

        });


      console.log(
        '📸 Picker result:',
        result,
      );


      // ------------------------------------------------------
      // CANCELLED
      // ------------------------------------------------------

      if (
        result.canceled
      ) {

        console.log(
          '⚠️ User cancelled image selection',
        );

        return;
      }


      // ======================================================
      // IMAGE ASSET
      // ======================================================

      const asset =
        result.assets?.[0];


      if (!asset) {

        Alert.alert(
          t.documents.uploadFailedTitle,
          t.documents.noImage,
        );

        return;
      }


      const uri =
        asset.uri;


      if (!uri) {

        Alert.alert(
          t.documents.uploadFailedTitle,
          t.documents.readImageFailed,
        );

        return;
      }


      console.log(
        '📁 Selected URI:',
        uri,
      );


      console.log(
        '📏 Image:',
        asset.width,
        'x',
        asset.height,
      );


      // ======================================================
      // FILE NAME
      // ======================================================

      let fileName =
        asset.fileName;


      if (
        !fileName ||
        fileName.trim().length === 0
      ) {

        fileName =
          `${type}-${Date.now()}.jpg`;

      }


      console.log(
        '📄 File name:',
        fileName,
      );


      // ======================================================
      // MIME TYPE
      // ======================================================

      let mimeType =
        asset.mimeType ||
        'image/jpeg';


      if (
        !ALLOWED_MIME_TYPES.includes(
          mimeType,
        )
      ) {

        console.log(
          '⚠️ Unsupported MIME type:',
          mimeType,
        );


        mimeType =
          'image/jpeg';

      }


      console.log(
        '🧾 MIME type:',
        mimeType,
      );


      // ======================================================
      // FORM DATA
      // ======================================================

      const formData =
        new FormData();


      formData.append(
        'documentType',
        type,
      );


      // ======================================================
      // EXPO FILE
      // ======================================================

      const documentFile =
        new ExpoFile(
          uri,
        );


      formData.append(
        'document',
        documentFile,
      );


      console.log(
        '📦 FormData created successfully',
      );


      // ======================================================
      // UPLOAD USER ID
      // ======================================================

      const uploadUserId =
        await getCurrentUserId();


      if (!uploadUserId) {

        throw new Error(
          t.documents.tryAgain,
        );
      }


      // ======================================================
      // API URL
      // ======================================================

      const url =
        `${API_BASE_URL}/documents/${uploadUserId}`;


      console.log(
        '🚀 Sending upload request:',
        url,
      );


      // ======================================================
      // UPLOAD
      // ======================================================

      const response =
        await fetch(
          url,
          {
            method: 'PUT',
            body: formData,
          },
        );


      console.log(
        '📡 PUT status:',
        response.status,
      );


      // ======================================================
      // RESPONSE
      // ======================================================

      const responseText =
        await response.text();


      console.log(
        '📦 PUT raw response:',
        responseText,
      );


      // ======================================================
      // PARSE
      // ======================================================

      let data: UploadResponse;


      try {

        data =
          JSON.parse(
            responseText,
          );

      } catch {

        throw new Error(
          t.documents.invalidResponse,
        );
      }


      // ======================================================
      // CHECK RESPONSE
      // ======================================================

      if (
        !response.ok ||
        !data.success
      ) {

        throw new Error(
          data.message ||
          t.documents.uploadError,
        );
      }


      // ======================================================
      // SERVER DOCUMENT
      // ======================================================

      const serverDocumentUri =
        data.document?.document_uri;


      if (
        !serverDocumentUri
      ) {

        throw new Error(
          t.documents.missingUrl,
        );
      }


      console.log(
        '🔗 Server document URL:',
        serverDocumentUri,
      );


      // ======================================================
      // UPDATE UI
      // ======================================================

      setDocuments(
        (previous) => ({
          ...previous,

          [type]:
            serverDocumentUri,
        }),
      );


      // ======================================================
      // SUCCESS
      // ======================================================

      Alert.alert(
        t.common.success,
        t.documents.uploadSuccess,
      );

    } catch (error) {

      console.error(
        '❌ Upload error:',
        error,
      );


      Alert.alert(
        t.documents.uploadFailedTitle,

        error instanceof Error
          ? error.message
          : t.documents.uploadError,
      );

    } finally {

      setUploading(
        null,
      );


      console.log(
        '🏁 Upload process finished:',
        type,
      );

    }
  };


  // ==========================================================
  // REMOVE DOCUMENT
  // ==========================================================

  const removeDocument = (
    type: DocumentType,
  ) => {

    console.log(
      '🗑️ Remove clicked:',
      type,
    );


    setDocuments(
      (previous) => ({
        ...previous,

        [type]:
          null,
      }),
    );
  };


  // ==========================================================
  // PROGRESS
  // ==========================================================

  const uploadedCount =
    Object.values(
      documents,
    ).filter(
      Boolean,
    ).length;


  const totalDocuments =
    DOCUMENTS.length;


  const allUploaded =
    uploadedCount ===
    totalDocuments;


  const remainingDocuments =
    totalDocuments -
    uploadedCount;


  // ==========================================================
  // CONTINUE
  // ==========================================================

  const handleContinue =
    async () => {

      console.log(
        '➡️ Continue clicked',
      );


      // ------------------------------------------------------
      // DOCUMENT CHECK
      // ------------------------------------------------------

      if (
        !allUploaded
      ) {

        const message =
          t.documents.uploadMore.replace(
            '{count}',
            String(
              remainingDocuments,
            ),
          );


        Alert.alert(
          t.documents.required,
          message,
        );


        return;
      }


      console.log(
        '✅ All documents uploaded',
      );


      // ------------------------------------------------------
      // USER
      // ------------------------------------------------------

      const userId =
        await getCurrentUserId();


      if (
        !userId
      ) {

        navigation.replace(
          'Login',
        );


        return;
      }


      try {

        // ----------------------------------------------------
        // CHECK ONBOARDING
        // ----------------------------------------------------

        const response =
          await fetch(
            `${API_BASE_URL}/onboarding/${userId}`,
          );


        const data =
          await response.json();


        console.log(
          '📦 Onboarding:',
          data,
        );


        // ----------------------------------------------------
        // NAVIGATION
        // ----------------------------------------------------

        if (
          data.success &&
          data.registrationCompleted
        ) {

          navigation.replace(
            'Dashboard',
          );

        } else {

          navigation.replace(
            'Selfie',
          );

        }

      } catch (error) {

        console.error(
          '❌ Onboarding error:',
          error,
        );


        navigation.replace(
          'Selfie',
        );

      }
    };


  // ==========================================================
  // LOADING SCREEN
  // ==========================================================

  if (
    loadingDocuments
  ) {

    return (
      <SafeAreaView
        style={
          styles.container
        }
      >

        <ScreenHeader
          title={
            t.documents.title
          }

          onBack={
            handleBack
          }
        />


        <View
          style={
            styles.loadingContainer
          }
        >

          <ActivityIndicator
            size="large"
            color={
              COLORS.primary
            }
          />


          <Text
            style={
              styles.loadingText
            }
          >
            {
              t.documents.loading
            }
          </Text>

        </View>

      </SafeAreaView>
    );
  }


  // ==========================================================
  // MAIN SCREEN
  // ==========================================================

  return (
    <SafeAreaView
      style={
        styles.container
      }
    >

      {/* =====================================================
          HEADER
      ====================================================== */}

      <ScreenHeader
        title={
          t.documents.title
        }

        onBack={
          handleBack
        }
      />


      <ScrollView
        contentContainerStyle={
          styles.content
        }

        showsVerticalScrollIndicator={
          false
        }
      >

        {/* ===================================================
            HEADER SECTION
        ==================================================== */}

        <View
          style={
            styles.header
          }
        >

          <View
            style={
              styles.iconCircle
            }
          >

            <Text
              style={
                styles.headerIcon
              }
            >
              📄
            </Text>

          </View>


          <Text
            style={
              styles.title
            }
          >
            {
              t.documents.uploadTitle
            }
          </Text>


          <Text
            style={
              styles.description
            }
          >
            {
              t.documents.description
            }
          </Text>

        </View>


        {/* ===================================================
            PROGRESS
        ==================================================== */}

        <View
          style={
            styles.progressCard
          }
        >

          <View
            style={
              styles.progressTop
            }
          >

            <Text
              style={
                styles.progressTitle
              }
            >
              {
                t.documents.verification
              }
            </Text>


            <Text
              style={
                styles.progressCount
              }
            >
              {uploadedCount}
              /
              {totalDocuments}
            </Text>

          </View>


          <View
            style={
              styles.progressTrack
            }
          >

            <View
              style={[
                styles.progressFill,
                {
                  width:
                    `${(
                      uploadedCount /
                      totalDocuments
                    ) * 100}%`,
                },
              ]}
            />

          </View>

        </View>


        {/* ===================================================
            DOCUMENT LIST
        ==================================================== */}

        <View
          style={
            styles.documentList
          }
        >

          {DOCUMENTS.map(
            (document) => {

              const uri =
                documents[
                  document.id
                ];


              const isUploading =
                uploading ===
                document.id;


              const anotherUploading =
                uploading !== null &&
                uploading !==
                  document.id;


              return (
                <View
                  key={
                    document.id
                  }

                  style={[
                    styles.documentCard,

                    uri &&
                      styles.documentCardUploaded,
                  ]}
                >

                  {/* =========================================
                      DOCUMENT HEADER
                  ========================================== */}

                  <View
                    style={
                      styles.documentTop
                    }
                  >

                    <View
                      style={
                        styles.documentIcon
                      }
                    >

                      <Text
                        style={
                          styles.documentEmoji
                        }
                      >
                        {
                          document.icon
                        }
                      </Text>

                    </View>


                    <View
                      style={
                        styles.documentInfo
                      }
                    >

                      <Text
                        style={
                          styles.documentTitle
                        }
                      >
                        {
                          t.documents[
                            document.id
                          ].title
                        }
                      </Text>


                      <Text
                        style={
                          styles.documentSubtitle
                        }
                      >
                        {uri
                          ? t.documents.uploadedSuccessfully
                          : t.documents[
                              document.id
                            ].subtitle}
                      </Text>

                    </View>


                    {uri && (

                      <View
                        style={
                          styles.checkCircle
                        }
                      >

                        <Text
                          style={
                            styles.check
                          }
                        >
                          ✓
                        </Text>

                      </View>

                    )}

                  </View>


                  {/* =========================================
                      UPLOADED DOCUMENT
                  ========================================== */}

                  {uri ? (

                    <View
                      style={
                        styles.previewContainer
                      }
                    >

                      <Image
                        source={{
                          uri,
                        }}

                        style={
                          styles.preview
                        }

                        resizeMode="cover"

                        onError={(
                          event,
                        ) => {

                          console.log(
                            '❌ Image preview error:',
                            event.nativeEvent,
                          );


                          console.log(
                            '🔗 Image URL:',
                            uri,
                          );

                        }}
                      />


                      <View
                        style={
                          styles.previewActions
                        }
                      >

                        <Pressable
                          onPress={() =>
                            pickDocument(
                              document.id,
                            )
                          }

                          disabled={
                            uploading !== null
                          }

                          style={({
                            pressed,
                          }) => [
                            styles.changeButton,

                            pressed &&
                              styles.pressed,

                            uploading !==
                              null &&
                              styles.disabled,
                          ]}
                        >

                          <Text
                            style={
                              styles.changeText
                            }
                          >
                            {
                              t.documents.change
                            }
                          </Text>

                        </Pressable>


                        <Pressable
                          onPress={() =>
                            removeDocument(
                              document.id,
                            )
                          }

                          disabled={
                            uploading !== null
                          }

                          style={({
                            pressed,
                          }) => [
                            styles.removeButton,

                            pressed &&
                              styles.pressed,

                            uploading !==
                              null &&
                              styles.disabled,
                          ]}
                        >

                          <Text
                            style={
                              styles.removeText
                            }
                          >
                            {
                              t.documents.remove
                            }
                          </Text>

                        </Pressable>

                      </View>

                    </View>

                  ) : (

                    /* =======================================
                       UPLOAD BUTTON
                    ======================================== */

                    <Pressable

                      onPress={() =>
                        pickDocument(
                          document.id,
                        )
                      }

                      disabled={
                        isUploading ||
                        anotherUploading
                      }

                      style={({
                        pressed,
                      }) => [
                        styles.uploadButton,

                        pressed &&
                          styles.pressed,

                        (
                          isUploading ||
                          anotherUploading
                        ) &&
                          styles.disabled,
                      ]}
                    >

                      {isUploading ? (

                        <ActivityIndicator
                          size="small"
                          color={
                            COLORS.primary
                          }

                          style={
                            styles.uploadLoader
                          }
                        />

                      ) : (

                        <Text
                          style={
                            styles.uploadIcon
                          }
                        >
                          ＋
                        </Text>

                      )}


                      <Text
                        style={
                          styles.uploadText
                        }
                      >
                        {isUploading
                          ? t.documents.uploading
                          : t.documents.uploadDocument}
                      </Text>

                    </Pressable>

                  )}

                </View>
              );
            },
          )}

        </View>


        {/* ===================================================
            INFO BOX
        ==================================================== */}

        <View
          style={
            styles.infoBox
          }
        >

          <Text
            style={
              styles.infoIcon
            }
          >
            ⓘ
          </Text>


          <View
            style={
              styles.infoContent
            }
          >

            <Text
              style={
                styles.infoTitle
              }
            >
              {
                t.documents.tipsTitle
              }
            </Text>


            <Text
              style={
                styles.infoText
              }
            >
              • {
                t.documents.tip1
              }
            </Text>


            <Text
              style={
                styles.infoText
              }
            >
              • {
                t.documents.tip2
              }
            </Text>


            <Text
              style={
                styles.infoText
              }
            >
              • {
                t.documents.tip3
              }
            </Text>

          </View>

        </View>


        {/* ===================================================
            CONTINUE BUTTON
        ==================================================== */}

        <View
          style={
            styles.bottom
          }
        >

          <PrimaryButton
            title={
              allUploaded
                ? t.documents.continue
                : t.documents.uploadMoreDocuments
            }

            onPress={
              handleContinue
            }

            disabled={
              !allUploaded ||
              uploading !== null
            }

            textColor={
              COLORS.white
            }
          />

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}


// ============================================================
// STYLES
// ============================================================

const styles =
  StyleSheet.create({

    // ========================================================
    // CONTAINER
    // ========================================================

    container: {
      flex: 1,

      backgroundColor:
        COLORS.background,
    },


    content: {
      padding:
        SPACING.xxl,

      paddingBottom:
        SPACING.huge,
    },


    // ========================================================
    // HEADER
    // ========================================================

    header: {
      alignItems:
        'center',

      marginTop:
        SPACING.lg,
    },


    iconCircle: {
      width:
        82,

      height:
        82,

      borderRadius:
        41,

      backgroundColor:
        COLORS.primaryLight,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginBottom:
        SPACING.lg,
    },


    headerIcon: {
      fontSize:
        38,
    },


    title: {
      color:
        COLORS.text,

      fontSize:
        FONT_SIZE.xxl,

      fontWeight:
        FONT_WEIGHT.extraBold,

      textAlign:
        'center',

      flexShrink:
        1,
    },


    description: {
      color:
        COLORS.textSecondary,

      fontSize:
        FONT_SIZE.sm,

      lineHeight:
        21,

      textAlign:
        'center',

      marginTop:
        SPACING.sm,

      flexShrink:
        1,
    },


    // ========================================================
    // PROGRESS
    // ========================================================

    progressCard: {
      marginTop:
        SPACING.xxl,

      padding:
        SPACING.lg,

      backgroundColor:
        COLORS.primaryLight,

      borderRadius:
        RADIUS.lg,
    },


    progressTop: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',
    },


    progressTitle: {
      color:
        COLORS.text,

      fontSize:
        FONT_SIZE.sm,

      fontWeight:
        FONT_WEIGHT.bold,

      flexShrink:
        1,
    },


    progressCount: {
      color:
        COLORS.primary,

      fontSize:
        FONT_SIZE.sm,

      fontWeight:
        FONT_WEIGHT.bold,

      marginLeft:
        SPACING.sm,
    },


    progressTrack: {
      height:
        7,

      backgroundColor:
        COLORS.white,

      borderRadius:
        RADIUS.round,

      overflow:
        'hidden',

      marginTop:
        SPACING.md,
    },


    progressFill: {
      height:
        '100%',

      backgroundColor:
        COLORS.primary,

      borderRadius:
        RADIUS.round,
    },


    // ========================================================
    // DOCUMENT LIST
    // ========================================================

    documentList: {
      marginTop:
        SPACING.xxl,

      gap:
        SPACING.md,
    },


    documentCard: {
      padding:
        SPACING.lg,

      borderRadius:
        RADIUS.lg,

      borderWidth:
        1,

      borderColor:
        COLORS.border,

      backgroundColor:
        COLORS.white,
    },


    documentCardUploaded: {
      borderColor:
        COLORS.success,
    },


    documentTop: {
      flexDirection:
        'row',

      alignItems:
        'center',
    },


    documentIcon: {
      width:
        52,

      height:
        52,

      borderRadius:
        RADIUS.md,

      backgroundColor:
        COLORS.primaryLight,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginRight:
        SPACING.md,

      flexShrink:
        0,
    },


    documentEmoji: {
      fontSize:
        25,
    },


    documentInfo: {
      flex:
        1,

      minWidth:
        0,
    },


    documentTitle: {
      color:
        COLORS.text,

      fontSize:
        FONT_SIZE.md,

      fontWeight:
        FONT_WEIGHT.bold,

      lineHeight:
        23,

      flexShrink:
        1,
    },


    documentSubtitle: {
      color:
        COLORS.textSecondary,

      fontSize:
        FONT_SIZE.xs,

      lineHeight:
        19,

      marginTop:
        3,

      flexShrink:
        1,
    },


    checkCircle: {
      width:
        28,

      height:
        28,

      borderRadius:
        14,

      backgroundColor:
        COLORS.success,

      alignItems:
        'center',

      justifyContent:
        'center',

      flexShrink:
        0,

      marginLeft:
        SPACING.xs,
    },


    check: {
      color:
        COLORS.white,

      fontSize:
        17,

      fontWeight:
        FONT_WEIGHT.bold,
    },


    // ========================================================
    // UPLOAD BUTTON
    // ========================================================

    uploadButton: {
      minHeight:
        54,

      paddingHorizontal:
        SPACING.md,

      paddingVertical:
        10,

      borderRadius:
        RADIUS.md,

      borderWidth:
        1,

      borderColor:
        COLORS.primary,

      borderStyle:
        'dashed',

      marginTop:
        SPACING.lg,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      width:
        '100%',
    },


    uploadIcon: {
      color:
        COLORS.primary,

      fontSize:
        22,

      lineHeight:
        26,

      marginRight:
        SPACING.sm,

      flexShrink:
        0,
    },


    uploadLoader: {
      marginRight:
        SPACING.sm,

      flexShrink:
        0,
    },


    // ========================================================
    // UPLOAD TEXT
    // ========================================================

    uploadText: {
      color:
        '#000000',

      fontSize:
        FONT_SIZE.sm,

      lineHeight:
        22,

      fontWeight:
        FONT_WEIGHT.bold,

      textAlign:
        'center',

      flexShrink:
        1,

      includeFontPadding:
        true,
    },


    // ========================================================
    // PRESSED / DISABLED
    // ========================================================

    pressed: {
      opacity:
        0.7,
    },


    disabled: {
      opacity:
        0.5,
    },


    // ========================================================
    // PREVIEW
    // ========================================================

    previewContainer: {
      marginTop:
        SPACING.lg,
    },


    preview: {
      width:
        '100%',

      height:
        170,

      borderRadius:
        RADIUS.md,

      backgroundColor:
        COLORS.surface,
    },


    previewActions: {
      flexDirection:
        'row',

      justifyContent:
        'flex-end',

      gap:
        SPACING.sm,

      marginTop:
        SPACING.sm,
    },


    changeButton: {
      minHeight:
        40,

      paddingHorizontal:
        SPACING.md,

      paddingVertical:
        8,

      borderRadius:
        RADIUS.sm,

      backgroundColor:
        COLORS.primaryLight,

      alignItems:
        'center',

      justifyContent:
        'center',

      flexShrink:
        0,
    },


    changeText: {
      color:
        COLORS.primary,

      fontSize:
        FONT_SIZE.xs,

      lineHeight:
        19,

      fontWeight:
        FONT_WEIGHT.bold,

      textAlign:
        'center',

      includeFontPadding:
        true,
    },


    removeButton: {
      minHeight:
        40,

      paddingHorizontal:
        SPACING.md,

      paddingVertical:
        8,

      borderRadius:
        RADIUS.sm,

      backgroundColor:
        '#FEECEC',

      alignItems:
        'center',

      justifyContent:
        'center',

      flexShrink:
        0,
    },


    removeText: {
      color:
        COLORS.error,

      fontSize:
        FONT_SIZE.xs,

      lineHeight:
        19,

      fontWeight:
        FONT_WEIGHT.bold,

      textAlign:
        'center',

      includeFontPadding:
        true,
    },


    // ========================================================
    // INFO BOX
    // ========================================================

    infoBox: {
      flexDirection:
        'row',

      padding:
        SPACING.lg,

      marginTop:
        SPACING.xxl,

      borderRadius:
        RADIUS.lg,

      backgroundColor:
        COLORS.surface,
    },


    infoIcon: {
      color:
        COLORS.primary,

      fontSize:
        22,

      lineHeight:
        24,

      marginRight:
        SPACING.md,

      flexShrink:
        0,
    },


    infoContent: {
      flex:
        1,

      minWidth:
        0,
    },


    infoTitle: {
      color:
        COLORS.text,

      fontSize:
        FONT_SIZE.sm,

      lineHeight:
        21,

      fontWeight:
        FONT_WEIGHT.bold,

      marginBottom:
        SPACING.sm,

      flexShrink:
        1,
    },


    infoText: {
      color:
        COLORS.textSecondary,

      fontSize:
        FONT_SIZE.xs,

      lineHeight:
        20,

      marginBottom:
        3,

      flexShrink:
        1,
    },


    // ========================================================
    // BOTTOM
    // ========================================================

    bottom: {
      marginTop:
        SPACING.xxl,

      paddingBottom:
        30,
    },


    // ========================================================
    // LOADING
    // ========================================================

    loadingContainer: {
      flex:
        1,

      alignItems:
        'center',

      justifyContent:
        'center',

      padding:
        SPACING.xxl,
    },


    loadingText: {
      color:
        COLORS.textSecondary,

      fontSize:
        FONT_SIZE.md,

      lineHeight:
        23,

      fontWeight:
        FONT_WEIGHT.semibold,

      marginTop:
        SPACING.md,

      textAlign:
        'center',

      includeFontPadding:
        true,

      flexShrink:
        1,
    },

  });