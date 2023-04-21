import * as React from "react";
import { useState } from "react";
import { useUserAuth } from "../hooks/useUserAuth";
import { Modal } from "./Modal";
import { MonogramPFP } from "./Monogram";
import { GroupProfileCardList } from "./ProfileCardGroupInfo";
import TextBox from "./TextBox";
import { extensionStorage } from "../utils/helpers/LocalStorageHelper";

export const ProfileCard = () => {
  const user = useUserAuth();
  const [loginModal, setloginModal] = useState(false);
  const [url, setUrl] = useState("https://gunn.flexisched.net");
  return (
    <div
      className={`z-30 min-w-72 max-w-[90vw] w-max absolute bottom-0 left-0 translate-y-3/4 group-hover:translate-y-[calc(100%)] group-hover:opacity-100 opacity-0 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 pt-4`}
    >
      <div
        className={`min-w-72 max-w-[90vw] w-max dark:bg-gray-750 shadow-lg bg-gray-50 p-6 flex flex-row items-center rounded-2xl gap-6`}
      >
        <MonogramPFP
          firstName={user?.firstName || "?"}
          lastName={user?.lastName}
          className={`w-20 h-20 shadow-md !text-3xl`}
        />
         
        <div className={`flex flex-col gap-4 items-start justify-center`}>
          {user ? (
            <div className={`flex flex-col gap-2 justify-center`}>
              <div
                className={`font-poppins font-bold text-xl dark:text-gray-100`}
              >
                {user?.firstName} {user?.lastName}
              </div>
              <GroupProfileCardList />
              <button
                className={`font-poppins font-bold text-xs text-gray-100 bg-gradient-to-r from-fuchsia-500 to-purple-500 px-4 py-3 rounded-2x mt-8 rounded-2xl`}
                onClick={() => {
                  extensionStorage.clear();
                  window.location.reload();
                }}
              >
                Log Out
              </button>
            </div>
          ) : (
            <>
              <button
                className={`font-poppins font-bold text-xs text-gray-100 bg-gradient-to-r from-fuchsia-500 to-purple-500 px-4 py-3 rounded-2xl`}
                onClick={() => {
                  setloginModal(true);
                }}
              >
                FlexiSched Login
              </button>
              <Modal
                visible={loginModal}
                onClose={() => setloginModal(false)}
                className={`!p-6`}
              >
                <div className={`w-screen/2 flex flex-col gap-6 items-start`}>
                  <div
                    className={`flex flex-col gap-3 items-start w-full text-base font-medium`}
                  >
                    {" "}
                    <span className={`dark:text-gray-100/50 text-gray-900/40 `}>
                      Enter the URL of your FlexiSched instance. eg.
                    </span>
                    <a
                      className={`hover:!text-fuchsia-500 text-purple-800 dark:text-purple-400 dark:hover:!text-fuchsia-300 underline transition-all cursor-pointer`}
                    >
                      https://gunn.flexisched.net
                    </a>
                  </div>

                  <TextBox
                    placeholder="Flexisched URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    classNamesInput={`w-full !rounded-2xl`}
                    classNamesParent={`w-full !rounded-2xl !text-base !font-medium`}
                  />
                  <button
                    className={`bg-gradient-to-br from-fuchsia-400 to-purple-600 rounded-2xl px-6 py-3 hover:brightness-110 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed text-white`}
                    disabled={(() => {
                      const match = url.match(
                        /^https?:\/\/([a-z0-9-]+\.)*[a-z0-9-]+$/
                      );
                      return (
                        !match || !url.toLowerCase().includes("flexisched")
                      );
                    })()}
                    onClick={() => {
                      chrome.tabs.create({
                        url: url.match(/dashboard\.php/) ? url : url + "/dashboard.php",
                      });
                    }}
                  >
                    Continue
                  </button>
                </div>
              </Modal>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
